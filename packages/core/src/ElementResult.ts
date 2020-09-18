import { IterationResult, TestResult, TestScriptResult } from '@flood/element-report'
import { ElementOptions } from './ElementOption'

export class ElementResult {
	private _result: TestResult

	constructor() {
		this._result = {
			testScripts: [],
			executionInfo: {
				dateTime: new Date(),
				mode: '',
				browser: [],
				os: '',
			},
		}
	}

	addExecutionInfo(opt: ElementOptions, isConfig: boolean): void {
		let modeName: string = opt.headless ? 'headless' : 'no-headless'
		modeName = isConfig ? `${modeName} with config` : modeName
		this._result.executionInfo.mode = modeName
		if (opt.browserType) {
			this._result.executionInfo.browser = [opt.browserType]
		}
	}

	addTestScript(file: string, iterationResult: IterationResult[]): void {
		let duration = 0
		iterationResult.forEach(item => (duration += item.duration ?? 0))
		const testScript: TestScriptResult = {
			name: file,
			iterationResults: iterationResult,
			duration: duration,
		}
		this._result.testScripts.push(testScript)
		this.summarizeResult()
	}

	summarizeResult(): void {
		let duration = 0
		this._result.testScripts.forEach(item => (duration += item.duration ?? 0))
		this._result.executionInfo.duration = duration
	}

	getResult(): TestResult {
		return this._result
	}
}
