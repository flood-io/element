// eslint-disable-next-line import/default
import osName from 'os-name'
import {
	IterationResult,
	TestResult,
	TestScriptResult,
	ScriptWithError,
} from '@flood/element-report'
import { ElementOptions } from './ElementOption'
import { join } from 'path'
import findRoot from 'find-root'

export class ElementResult {
	private _result: TestResult

	constructor() {
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const pkg = require(join(findRoot(__dirname), 'package.json'))

		this._result = {
			testScripts: [],
			executionInfo: {
				time: new Date().toLocaleString(undefined, {
					day: '2-digit',
					month: 'short',
					year: 'numeric',
					hour: '2-digit',
					minute: '2-digit',
					second: '2-digit',
				}),
				mode: '',
				os: osName(),
				elementVersion: pkg.version,
				nodeVersion: process.version,
			},
			scriptsWithError: [],
		}
	}

	addExecutionInfo(opt: ElementOptions, isConfig: boolean): void {
		let modeName: string = opt.headless ? 'headless' : 'no-headless'
		modeName = isConfig ? `${modeName} with config file` : modeName
		this._result.executionInfo.mode = modeName
	}

	addTestScript(file: string, iterationResults: IterationResult[]): void {
		let duration = 0
		iterationResults.forEach((item) => (duration += item.duration ?? 0))
		const testScript: TestScriptResult = {
			name: file,
			iterationResults,
			duration,
		}
		this._result.testScripts.push(testScript)
		this.summarizeResult()
	}

	addScriptWithError(script: ScriptWithError): void {
		this._result.scriptsWithError.push(script)
	}

	summarizeResult(): void {
		let duration = 0
		this._result.testScripts.forEach((item) => (duration += item.duration ?? 0))
		this._result.executionInfo.duration = duration
	}

	getResult(): TestResult {
		return this._result
	}
}
