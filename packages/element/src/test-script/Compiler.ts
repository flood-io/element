import {
	ITestScript,
	TestScriptError,
	TestScriptOptions,
	TestScriptDefaultOptions,
} from '../TestScript'
import { CategorisedDiagnostics } from './TypescriptDiagnostics'
import * as ts from 'typescript'
import * as path from 'path'
import { VMScript } from 'vm2'
import * as parseComments from 'comment-parser'
import { SourceUnmapper } from './SourceUnmapper'
import * as debugFactory from 'debug'

const debug = debugFactory('element:compiler')

const floodelementRoot = path.join(__dirname, '../..')
const sandboxPath = 'test-script-sandbox'
const sandboxRoot = path.join(floodelementRoot, sandboxPath)
const sandboxedBasenameTypescript = 'flood-chrome.ts'
const sandboxedBasenameJavascript = 'flood-chrome.js'

const NoModuleImportedTypescript = `Test scripts must import the module '@flood/element'
Please add an import as follows:

import { suite } from '@flood/element'
`

const NoModuleImportedJavascript = `Test scripts must import the module '@flood/element'
Please add an import as follows:

import { suite } from '@flood/element'
`

const FloodChromeErrors = {
	NoModuleImportedTypescript,
	NoModuleImportedJavascript,
}

const defaultCompilerOptions: ts.CompilerOptions = {
	noEmitOnError: true,
	noImplicitAny: false,
	noUnusedParameters: false,
	noUnusedLocals: false,
	allowSyntheticDefaultImports: true,
	experimentalDecorators: true,
	allowJs: true,
	checkJs: true,
	suppressOutputPathCheck: true,

	sourceMap: true,

	// useful for our debugging
	// traceResolution: true,

	rootDirs: [sandboxRoot],

	module: ts.ModuleKind.CommonJS,
	moduleResolution: ts.ModuleResolutionKind.NodeJs,
	target: ts.ScriptTarget.ES2017,

	pretty: true,
	lib: [
		'lib.dom.d.ts',
		'lib.dom.iterable.d.ts',
		'lib.es2017.d.ts',
		'lib.es2016.array.include.d.ts',
		'lib.es2017.object.d.ts',
	],
	types: ['@types/node'],
	typeRoots: ['node_modules/@types'],
}

type sourceKinds = 'typescript' | 'javascript'

interface OutputFile {
	name: string
	text: string
	writeByteOrderMark: boolean
}

export class TypeScriptTestScript implements ITestScript {
	public sandboxedBasename: string
	public sandboxedFilename: string
	public sandboxedRelativeFilename: string
	public source: string
	public sourceMap: string
	private sourceUnmapper: SourceUnmapper
	public floodChromeErrors: string[] = []
	public sourceKind: sourceKinds
	private vmScriptMemo: VMScript
	private diagnostics: CategorisedDiagnostics
	public testScriptOptions: TestScriptOptions

	constructor(
		public originalSource: string,
		public originalFilename: string,
		options: TestScriptOptions = TestScriptDefaultOptions,
	) {
		this.testScriptOptions = { ...TestScriptDefaultOptions, ...options }

		if (this.originalFilename.endsWith('.js')) {
			this.sourceKind = 'javascript'
			this.sandboxedBasename = sandboxedBasenameJavascript
		} else {
			this.sourceKind = 'typescript'
			this.sandboxedBasename = sandboxedBasenameTypescript
		}
		this.sandboxedFilename = path.join(sandboxRoot, this.sandboxedBasename)
		this.sandboxedRelativeFilename = path.join(sandboxPath, this.sandboxedBasename)
	}

	public get hasErrors(): boolean {
		return this.floodChromeErrors.length > 0 || this.diagnostics.has('errors')
	}

	public get formattedErrorString(): string {
		let errors: string[] = []

		if (this.floodChromeErrors.length > 0) {
			errors = errors.concat(this.floodChromeErrors)
		}

		if (this.diagnostics) {
			errors.push(this.diagnostics.formattedForCategory('errors'))
		}

		return errors.join('\n')
	}

	get compilerOptions(): ts.CompilerOptions {
		const compilerOptions = Object.assign({}, defaultCompilerOptions)

		if (this.testScriptOptions.stricterTypeChecking) {
			compilerOptions.noImplicitAny = true
		}

		return compilerOptions
	}

	public async compile(): Promise<TypeScriptTestScript> {
		if (!this.isFloodElementCorrectlyImported) {
			switch (this.sourceKind) {
				case 'javascript':
					this.floodChromeErrors.push(FloodChromeErrors.NoModuleImportedJavascript)
					break
				case 'typescript':
					this.floodChromeErrors.push(FloodChromeErrors.NoModuleImportedTypescript)
					break
			}
			return this
		}

		// debugger

		// const sandboxedBasename = this.sandboxedBasename
		const sandboxedFilename = this.sandboxedFilename
		const inputSource = this.originalSource

		const compilerOptions = this.compilerOptions

		const host = ts.createCompilerHost(compilerOptions)

		const outputFiles: OutputFile[] = []
		host.writeFile = function(name, text, writeByteOrderMark) {
			outputFiles.push({ name, text, writeByteOrderMark })
		}

		const originalGetSourceFile = host.getSourceFile
		host.getSourceFile = function(
			fileName: string,
			languageVersion: ts.ScriptTarget,
			onError?: (message: string) => void,
		): ts.SourceFile {
			debug('getSourceFile', fileName)
			// inject our source string if its the sandboxedBasename
			if (fileName == sandboxedFilename) {
				return ts.createSourceFile(fileName, inputSource, languageVersion, false)
			} else {
				return originalGetSourceFile.apply(this, arguments)
			}
		}

		const moduleResolutionCache = ts.createModuleResolutionCache(host.getCurrentDirectory(), x =>
			host.getCanonicalFileName(x),
		)

		host.resolveModuleNames = function(
			moduleNames: string[],
			containingFile: string,
		): ts.ResolvedModule[] {
			const resolvedModules: ts.ResolvedModule[] = []

			for (let moduleName of moduleNames) {
				debug('resolve', moduleName)
				if (moduleName === '@flood/chrome' || moduleName === '@flood/element') {
					debug('resolving @flood/element as %s', path.join(floodelementRoot, 'index.d.ts'))
					resolvedModules.push({
						resolvedFileName: path.join(floodelementRoot, 'index.d.ts'),
						isExternalLibraryImport: true,
					})
					continue
				}

				// TODO manually resolve all the allowed files

				const result = ts.resolveModuleName(
					moduleName,
					containingFile,
					compilerOptions,
					host,
					moduleResolutionCache,
				).resolvedModule! // original-TODO: GH#18217

				resolvedModules.push(result)
			}
			return resolvedModules
		}

		const program = ts.createProgram([this.sandboxedFilename], compilerOptions, host)
		const emitResult = program.emit()

		this.diagnostics = new CategorisedDiagnostics(host, this.filenameMapper.bind(this))

		// sortAndDeduplicateDiagnostics when its released
		const allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics)

		allDiagnostics.forEach(diagnostic => this.diagnostics.add(diagnostic))

		if (emitResult.emitSkipped) {
			return this
		}

		console.assert(outputFiles.length == 2, 'There should only be two output files')

		// XXX tidy
		this.source = (outputFiles.find(f => f.name.endsWith('.js')) || { text: '' }).text
		this.sourceMap = (outputFiles.find(f => f.name.endsWith('.js.map')) || { text: '' }).text

		this.sourceUnmapper = await SourceUnmapper.init(
			this.originalSource,
			this.originalFilename,
			this.sourceMap,
		)

		return this
	}

	public filenameMapper(filename: string): string {
		if (filename == this.sandboxedFilename || filename == this.sandboxedBasename) {
			return this.originalFilename
		} else {
			return filename
		}
	}

	public get vmScript(): VMScript {
		if (!this.vmScriptMemo) {
			this.vmScriptMemo = new VMScript(this.source, this.sandboxedFilename)
		}

		return this.vmScriptMemo
	}

	public get isFloodElementCorrectlyImported(): boolean {
		return (
			this.originalSource.includes('@flood/chrome') ||
			this.originalSource.includes('@flood/element')
		)
	}

	public get testName(): string {
		return this.parsedComments('name')
	}

	public get testDescription(): string {
		return this.parsedComments('description')
	}

	private parsedCommentsMemo: { name: string; description: string }
	private parsedComments(key: string) {
		if (!this.parsedCommentsMemo) {
			let comments = parseComments(this.originalSource)
			let description = '',
				name = ''
			if (comments.length) {
				let { description: body } = comments[0]
				let [line1, ...lines] = body.split('\n')
				name = line1
				description = lines
					.filter(l => l.length)
					.join('\n')
					.trim()
			}
			this.parsedCommentsMemo = { name, description }
		}

		return this.parsedCommentsMemo[key]
	}

	public liftError(error: Error): TestScriptError {
		let stack = error.stack || ''

		const filteredStack = stack.split('\n').filter(s => s.includes(this.sandboxedFilename))
		let callsite
		let unmappedStack: string[] = []

		if (filteredStack.length > 0) {
			callsite = this.sourceUnmapper.unmapCallsite(filteredStack[0])
			unmappedStack = this.sourceUnmapper.unmapStackNodeStrings(filteredStack)
		}

		return new TestScriptError(error.message, stack, callsite, unmappedStack)
	}

	public maybeLiftError(error: Error): Error {
		const lifted: TestScriptError = this.liftError(error)
		if (lifted.callsite) {
			return lifted
		} else {
			return error
		}
	}

	public filterAndUnmapStack(stack: string | undefined): string[] {
		stack = stack || ''
		const filteredStack = stack.split('\n').filter(s => s.includes(this.sandboxedFilename))

		return this.sourceUnmapper.unmapStackNodeStrings(filteredStack)
	}
}
