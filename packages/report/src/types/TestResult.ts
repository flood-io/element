import { Status } from './Status'
export type Milliseconds = number

export type TestResult = {
	executionInfo: ExecutionInfo
	testScripts: Array<TestScriptResult>
	scriptsWithError: ScriptWithError[]
}

export type ScriptWithError = {
	name: string
	error: string
}

export type ExecutionInfo = {
	date: string
	time: string
	duration?: Milliseconds
	mode: string
	browser: Array<string>
	os: string
}

export type TestScriptResult = {
	name: string
	duration?: Milliseconds
	iterationResults: Array<IterationResult>
}

export type IterationResult = {
	name: string
	duration?: Milliseconds
	stepResults: Array<StepResult>
}

export type StepResult = {
	name: string
	status: Status
	subTitle?: string
	duration?: Milliseconds
}
