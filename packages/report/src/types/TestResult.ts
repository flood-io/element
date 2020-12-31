import { Status } from './Status'

type Milliseconds = number

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
	time: string
	duration?: Milliseconds
	mode: string
	os: string
	nodeVersion: string
	elementVersion: string
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
	error?: string
}
