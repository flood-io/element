import { Compiler, CompilerOutput } from '@flood/element-compiler'

import { ITestScript } from '../ITestScript'
import { VMScript } from 'vm2'
import { TestScriptOptions, TestScriptDefaultOptions } from '../TestScript'

export default class WebpackCompiler implements ITestScript {
	private vmScriptCache: VMScript
	private result?: CompilerOutput

	constructor(public sourceFile: string, options: TestScriptOptions = TestScriptDefaultOptions) {}

	public async compile(): Promise<TypeScriptTestScript> {
		let compiler = new Compiler(this.sourceFile)
		let output = await compiler.emit()

		this.result = output
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
}
