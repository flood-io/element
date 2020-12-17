import { CompoundMeasurement, MeasurementKind, TestEvent, TraceData } from '../types/Report'
import { TestScriptError } from './TestScriptError'

export type Worker = {
	id: string
	name: string
	iteration: number
}

export class WorkerReport {
	public id: string
	public name: string
	public iteration: number

	constructor(id: string, name: string) {
		this.id = id
		this.name = name
	}

	setIteration(iteration: number): void {
		this.iteration = iteration
	}
}

export interface IReporter {
	reset(stepName: string): void

	responseCode: string
	stepName: string
	worker?: WorkerReport

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
	setWorker?(worker: WorkerReport): void
	sendReport?(msg: string, type: 'action' | 'iteration' | 'measurement'): void
}
