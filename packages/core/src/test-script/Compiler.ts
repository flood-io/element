import { TestScriptError, TestScriptOptions, TestScriptDefaultOptions } from '../TestScript'
import { ITestScript } from '../ITestScript'
import { CategorisedDiagnostics } from './TypescriptDiagnostics'
import {
	CompilerOptions,
	ResolvedModule,
	ResolvedTypeReferenceDirective,
	ModuleKind,
	ScriptTarget,
	ModuleResolutionKind,
	createCompilerHost,
	SourceFile,
	createSourceFile,
	createModuleResolutionCache,
	resolveModuleName,
	createProgram,
	getPreEmitDiagnostics,
	SortedReadonlyArray,
	Diagnostic,
	sortAndDeduplicateDiagnostics,
	resolveTypeReferenceDirective,
} from 'typescript'
import path from 'path'
import { VMScript } from 'vm2'
import parseComments from 'comment-parser'
import { SourceUnmapper } from './SourceUnmapper'
import debugFactory from 'debug'
import { TestScriptHost } from './TestScriptHost'

const debug = debugFactory('element:test-script:compiler')

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

const defaultCompilerOptions: CompilerOptions = {
	noEmitOnError: true,
	noImplicitAny: false,
	strictNullChecks: false,
	noUnusedParameters: false,
	noUnusedLocals: false,
	allowSyntheticDefaultImports: true,
	experimentalDecorators: true,
	allowJs: true,
	checkJs: false,
	suppressOutputPathCheck: true,

	sourceMap: true,

	// tracing useful for our debugging
	traceResolution: false,

	module: ModuleKind.CommonJS,
	moduleResolution: ModuleResolutionKind.NodeJs,
	target: ScriptTarget.ES2015,

	pretty: true,

	// lib: ['lib.esnext.full.d.ts'],
	lib: ['lib.dom.d.ts', 'lib.es2019.d.ts'],
	typeRoots: ['node_modules/@types'],

	baseUrl: './',
	paths: { '*': ['node_modules/@types/*', '*'] },

	// typeRoots: ['./node_modules/@types'],
	// baseUrl: '../..',
	// paths: {
	// 	'*': ['node_modules/@types/*', '*'],
	// },
	// types: ['@types/node'],

	// esModuleInterop: true,
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
	private host: TestScriptHost

	constructor(
		public originalSource: string,
		public originalFilename: string,
		options: TestScriptOptions = TestScriptDefaultOptions,
	) {
		this.host = new TestScriptHost()
		this.testScriptOptions = Object.assign({}, TestScriptDefaultOptions, options)

		if (this.originalFilename.endsWith('.js')) {
			this.sourceKind = 'javascript'
			this.sandboxedBasename = this.host.sandboxedBasenameJavascript
		} else {
			this.sourceKind = 'typescript'
			this.sandboxedBasename = this.host.sandboxedBasenameTypescript
		}
		this.sandboxedFilename = path.join(this.host.sandboxRoot, this.sandboxedBasename)
		this.sandboxedRelativeFilename = path.join(this.host.sandboxPath, this.sandboxedBasename)
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

	get compilerOptions(): CompilerOptions {
		const compilerOptions = { ...defaultCompilerOptions, rootDirs: [this.host.sandboxRoot] }

		if (this.testScriptOptions.stricterTypeChecking) {
			compilerOptions.strictNullChecks = true
			compilerOptions.noImplicitAny = true
		}

		if (this.testScriptOptions.traceResolution || debug.enabled) {
			compilerOptions.traceResolution = true
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

		const sandboxedFilename = this.sandboxedFilename
		const inputSource = this.originalSource

		const compilerOptions = this.compilerOptions

		const host = createCompilerHost(compilerOptions)

		const outputFiles: OutputFile[] = []
		host.writeFile = function(name, text, writeByteOrderMark) {
			outputFiles.push({ name, text, writeByteOrderMark })
		}

		const tsSandboxedFilename = path.normalize(sandboxedFilename)
		const originalGetSourceFile = host.getSourceFile
		host.getSourceFile = function(
			fileName: string,
			languageVersion: ScriptTarget,
			onError?: (message: string) => void,
		): SourceFile {
			debug('getSourceFile', fileName)
			// inject our source string if its the sandboxedBasename
			if (fileName === tsSandboxedFilename) {
				return createSourceFile(fileName, inputSource, languageVersion, false)
			} else {
				return originalGetSourceFile.apply(this, arguments)
			}
		}

		const moduleResolutionCache = createModuleResolutionCache(host.getCurrentDirectory(), x =>
			host.getCanonicalFileName(x),
		)

		host.resolveModuleNames = (moduleNames: string[], containingFile: string): ResolvedModule[] => {
			const resolvedModules: ResolvedModule[] = []
			// debugger

			for (let moduleName of moduleNames) {
				debug('resolve', moduleName)

				let result = this.host.resolveModuleDefinition(moduleName)

				if (result == null) {
					result = resolveModuleName(
						moduleName,
						containingFile,
						compilerOptions,
						host,
						moduleResolutionCache,
					).resolvedModule! // original-TODO: GH#18217
				}
				// if (!result)
				// 	throw new Error(`Unable to resolve module during script compilation: ${moduleName}`)

				resolvedModules.push(result)
			}
			return resolvedModules
		}

		let referenceCache = new Map()

		host.resolveTypeReferenceDirectives = (
			typeReferenceDirectiveNames: string[],
			containingFile: string,
		): ResolvedTypeReferenceDirective[] => {
			debug('resolveTypeReferenceDirectives', typeReferenceDirectiveNames, containingFile)
			return typeReferenceDirectiveNames.map(typeRef => {
				if (referenceCache.has(typeRef)) {
					return referenceCache.get(typeRef)
				}

				let typeResolution =
					this.host.resolveTypeReferenceDirective(typeRef) ||
					resolveTypeReferenceDirective(typeRef, containingFile, compilerOptions, host)
						.resolvedTypeReferenceDirective!

				referenceCache.set(typeRef, typeResolution)

				return typeResolution
			})
		}

		const program = createProgram(
			[this.host.ambientDeclarationsFile, this.sandboxedFilename],
			compilerOptions,
			host,
		)
		const emitResult = program.emit()

		this.diagnostics = new CategorisedDiagnostics(host, this.filenameMapper.bind(this))

		// sortAndDeduplicateDiagnostics when its released
		let preEmitDiagnostics = getPreEmitDiagnostics(program).concat(emitResult.diagnostics)
		let sortedDiagnostics: SortedReadonlyArray<Diagnostic> = sortAndDeduplicateDiagnostics(
			preEmitDiagnostics,
		)
		sortedDiagnostics.forEach(diagnostic => this.diagnostics.add(diagnostic))

		if (emitResult.emitSkipped) {
			return this
		}

		console.assert(outputFiles.length == 2, 'There should only be two output files')

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
		return this.originalSource.includes('@flood/element')
	}

	public get testName(): string {
		return this.parsedComments('name')
	}

	public get testDescription(): string {
		return this.parsedComments('description')
	}

	private parsedCommentsMemo: { [index: string]: string; name: string; description: string }

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
					.filter((l: string) => l.length)
					.join('\n')
					.trim()
			}
			this.parsedCommentsMemo = { name, description }
		}

		return this.parsedCommentsMemo[key]
	}

	public isScriptError(error: Error): boolean {
		const stack = error.stack || ''
		return stack.split('\n').filter(s => s.includes(this.sandboxedFilename)).length > 0
	}

	public liftError(error: Error): TestScriptError {
		const stack = error.stack || ''

		const filteredStack = stack.split('\n').filter(s => s.includes(this.sandboxedFilename))
		let callsite
		let unmappedStack: string[] = []

		if (filteredStack.length > 0) {
			callsite = this.sourceUnmapper.unmapCallsite(filteredStack[0])
			unmappedStack = this.sourceUnmapper.unmapStackNodeStrings(filteredStack)
		}

		return new TestScriptError(error.message, stack, callsite, unmappedStack, error)
	}

	public maybeLiftError(error: Error): Error {
		if (this.isScriptError(error)) {
			return this.liftError(error)
		} else {
			return error
		}
	}

	public filterAndUnmapStack(input: string | Error | undefined): string[] {
		let stack: string

		if (input === undefined) {
			return []
		} else if (typeof input === 'string') {
			stack = input
		} else {
			const maybeStack = input.stack
			if (maybeStack === undefined) {
				return []
			} else {
				stack = maybeStack
			}
		}

		const filteredStack = stack.split('\n').filter(s => s.includes(this.sandboxedFilename))

		return this.sourceUnmapper.unmapStackNodeStrings(filteredStack)
	}
}
