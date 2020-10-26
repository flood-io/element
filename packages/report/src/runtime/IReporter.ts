import { CompoundMeasurement, MeasurementKind, TestEvent, TraceData } from '../types/Report'
import { TestScriptError } from './TestScriptError'

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
	addMeasurement(
		measurement: MeasurementKind,
		value: string | number,
		label?: string,
		errorMessage?: string,
	): void

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

	testLifecycle(
		stage: TestEvent,
		label: string,
		subtitle?: string,
		timing?: number,
		errorMessage?: string,
		content?: any[],
		arg?: string,
	): void

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
