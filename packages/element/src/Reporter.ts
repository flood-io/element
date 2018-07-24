import { Assertion } from './runtime/Test'
import { TestScriptError } from './TestScript'

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

interface CompositeTraceData {
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
}

export interface TestLifecycle {
	label: string
	event: TestEvent
}

export interface IReporter {
	reset(stepName: string): void

	responseCode: string
	stepName: string

	/**
	 * Writes a measurement to the collection service
	 *
	 * @param {string} measurement
	 * @param {string} value
	 * @param {string} label
	 * @param {string} responseCode
	 * @returns {Promise<void>}
	 * @memberof IReporter
	 */
	addMeasurement(measurement: MeasurementKind, value: string | number, label?: string): void

	addCompoundMeasurement(
		measurement: MeasurementKind,
		value: CompoundMeasurement,
		label: string,
	): void

	/**
	 * Flushes measurements to the collection service
	 */
	flushMeasurements(): Promise<void>

	/**
	 * Writes a trace to the collection service
	 *
	 * @param {*} traceData
	 * @param {string} label
	 * @param {string} responseCode
	 * @returns {Promise<void>}
	 * @memberof IReporter
	 */
	addTrace(traceData: TraceData, label: string): void

	testLifecycle(event: TestEvent, label: string): void

	testAssertionError(err: TestScriptError): void
	testStepError(err: TestScriptError): void
	testInternalError(message: string, err: Error): void

	// NOTE that this is synchronous
	// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/node/v8/index.d.ts#L25
	testScriptConsole(method: string, message?: any, ...optionalParams: any[]): void

	// Used by EventEmitterReporter
	addListener?(event: string | symbol, listener: (...args: any[]) => void): this
	on?(event: string | symbol, listener: (...args: any[]) => void): this
	once?(event: string | symbol, listener: (...args: any[]) => void): this
}
