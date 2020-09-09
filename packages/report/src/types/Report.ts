import { Assertion } from './Assertion'

export type MeasurementKind =
	| 'throughput'
	| 'concurrency'
	| 'response_time'
	| 'transaction_rate'
	| 'passed'
	| 'failed'
	| 'latency'
	| 'network_throughput'
	| 'trace'
	| 'object'
	| string

export type CompoundMeasurementKind =
	| 'dom_complete'
	| 'dom_interactive'
	| 'time_to_first_interactive'
	| 'first_paint'
	| 'first_contentful_paint'

export type CompoundMeasurement = { [key in CompoundMeasurementKind]?: number }

export interface Measurement {
	measurement: MeasurementKind
	label: string
	value: string
	responseCode: string
}

export interface TracedScriptError {
	name?: string
	message: string
	stack: string
}

export type TraceData = CompositeTraceData | NetworkTraceData | ScreenshotTraceData

interface BaseTraceData {
	op: string
	label?: string
	sampleCount: number
	errorCount: number
	assertions?: Assertion[]
	errors?: TracedScriptError[]
}

export interface CompositeTraceData {
	op: string
	label: string
	objects: string[]
	errors: any[]
	assertions: any[]
	objectTypes: string[]
}

export interface NetworkTraceData extends BaseTraceData {
	har?: any
	objects?: string[]

	// Deprecated
	files?: string[]

	startTime?: number
	endTime?: number
	url?: string
	requestHeaders?: string
	responseHeaders?: string
	responseData?: string
	sourceHost?: string
}

export interface ScreenshotTraceData extends BaseTraceData {
	objects: string[]

	// Deprecated
	files?: string[]
}

// NOTE: these need to track the Lifecycle enum in control.proto
export enum TestEvent {
	Setup = 1,
	BeforeTest,
	BeforeStep,
	BeforeStepAction,
	AfterStepAction,
	StepSucceeded,
	StepFailed,
	StepSkipped,
	AfterStep,
	TestSucceeded,
	TestFailed,
	AfterTest,
	Exit,
	BeforeAllStep,
	AfterAllStep,
	BeforeEachStep,
	AfterEachStep,
	BeforeAllStepFinished,
	AfterAllStepFinished,
	BeforeEachStepFinished,
	AfterEachStepFinished,
	StepUnexecuted,
}

export interface TestLifecycle {
	label: string
	event: TestEvent
}
