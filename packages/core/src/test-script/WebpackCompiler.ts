import { Compiler, CompilerOutput } from '@flood/element-compiler'
import parseComments from 'comment-parser'
import { ITestScript } from '../ITestScript'
import { VMScript } from 'vm2'
import { TestScriptOptions, TestScriptDefaultOptions, TestScriptError } from '../TestScript'
import { readFileSync } from 'fs-extra'
import { SourceUnmapper } from './SourceUnmapper'
import { join, dirname } from 'path'

export default class WebpackCompiler implements ITestScript {
	private vmScriptCache: VMScript
	private result?: CompilerOutput
	private sourceUnmapper: SourceUnmapper

	constructor(public sourceFile: string, _options: TestScriptOptions = TestScriptDefaultOptions) {}

	public async compile(): Promise<this> {
		const compiler = new Compiler(this.sourceFile)
		const output = await compiler.emit()
		this.result = output

		this.sourceUnmapper = await SourceUnmapper.init(
			// this.originalSource,
			output.content,
			this.sourceFile,
			this.sourceMap,
		)

		return this
	}

	public get scriptRoot() {
		return dirname(this.sourceFile)
	}

	public get isFloodElementCorrectlyImported(): boolean {
		return this.originalSource.includes('@flood/element')
	}

	get originalSource(): string {
		return readFileSync(this.sourceFile, { encoding: 'utf8' })
	}

	get sandboxedFilename() {
		return this.sourceFile
	}

	get source() {
		return this.result?.content ?? ''
	}

	get sourceMap() {
		return this.result?.sourceMap ?? ''
	}

	public get testName(): string {
		return this.parsedComments('name')
	}

	public get testDescription(): string {
		return this.parsedComments('description')
	}

	public get formattedErrorString(): string {
		return this.result?.stats?.toString() ?? ''
	}

	public get hasErrors(): boolean {
		if (this.result == null) return false
		return (this.result?.stats?.hasErrors() || this.result?.stats?.hasWarnings()) ?? false
	}

	public isScriptError(error: Error): boolean {
		const stack = error.stack || ''
		return stack.split('\n').filter(s => s.includes(this.sourceFile)).length > 0
	}

	liftError?(error: Error): TestScriptError {
		const stack = error.stack || ''

		const filteredStack = stack.split('\n').filter(s => s.includes(this.sourceFile))
		let callsite
		let unmappedStack: string[] = []

		if (filteredStack.length > 0) {
			callsite = this.sourceUnmapper.unmapCallsite(filteredStack[0])
			unmappedStack = this.sourceUnmapper.unmapStackNodeStrings(filteredStack)
		}

		return new TestScriptError(error.message, stack, callsite, unmappedStack, error)
	}

	// maybeLiftError?(error: Error): Error {}

	// filterAndUnmapStack?(stack: string | Error | undefined): string[] {}

	public get vmScript(): VMScript {
		if (!this.vmScriptCache) {
			this.vmScriptCache = new VMScript(
				// wrapCodeInModuleWrapper(this.source),
				this.source,
				this.sandboxedFilename,
			)
		}

		return this.vmScriptCache
	}

	private parsedCommentsMemo: { [index: string]: string; name: string; description: string }

	private parsedComments(key: string) {
		if (!this.parsedCommentsMemo) {
			const comments = parseComments(this.originalSource)
			let description = '',
				name = ''
			if (comments.length) {
				const { description: body } = comments[0]
				const [line1, ...lines] = body.split('\n')
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
}
