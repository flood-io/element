import { Status } from './Status'
export type Milliseconds = number

export type TestResult = {
	executionInfo: ExecutionInfo
	testScripts: Array<TestScriptResult>
}

export type ExecutionInfo = {
	dateTime: Date
	duration?: Milliseconds | null
	mode: string
	browser: Array<string>
	os: string
}

export type TestScriptResult = {
	name: string
	duration?: Milliseconds | null
	iterationResults: Array<IterationResult>
}

export type IterationResult = {
	name: string
	duration?: Milliseconds | null
	stepResults: Array<StepResult>
}

export type StepResult = {
	name: string
	status: Status
	subTitle?: string
	duration?: Milliseconds | null
}
