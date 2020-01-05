import { Compiler, CompilerOutput } from '@flood/element-compiler'
import parseComments from 'comment-parser'
import { ITestScript } from '../ITestScript'
import { VMScript } from 'vm2'
import { TestScriptOptions, TestScriptDefaultOptions } from '../TestScript'
import { readFileSync } from 'fs-extra'

export default class WebpackCompiler implements ITestScript {
	private vmScriptCache: VMScript
	private result?: CompilerOutput

	constructor(public sourceFile: string, options: TestScriptOptions = TestScriptDefaultOptions) {}

	public async compile(): Promise<this> {
		let compiler = new Compiler(this.sourceFile)
		let output = await compiler.emit()
		this.result = output

		console.log(this.source)
		return this
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
		return ''
	}

	public get testName(): string {
		return this.parsedComments('name')
	}

	public get testDescription(): string {
		return this.parsedComments('description')
	}

	public get formattedErrorString(): string {
		return this.result?.stats.toString({ errors: true, warnings: true }) ?? ''
	}

	public get hasErrors(): boolean {
		if (this.result == null) return false
		return this.result.stats.hasErrors() || this.result.stats.hasWarnings()
	}

	public get vmScript(): VMScript {
		if (!this.vmScriptCache) {
			this.vmScriptCache = new VMScript(this.source, this.sandboxedFilename)
		}

		return this.vmScriptCache
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
}
