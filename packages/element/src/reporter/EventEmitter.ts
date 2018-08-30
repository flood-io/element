import {
	IReporter,
	Measurement,
	TraceData,
	TestEvent,
	TestLifecycle,
	CompoundMeasurement,
	MeasurementKind,
} from './../Reporter'
import { EventEmitter } from 'events'
import { TestScriptError } from './../TestScript'
import { expect } from '../utils/Expect'

export interface TestStepError {
	message: string
	step: string
	error: Error
}

export declare interface EventEmitterReporter {
	on(event: 'measurement', listener: (measurement: Measurement) => void): this
	on(
		event: 'trace',
		listener: (label: string, responseCode: string, trace: TraceData) => void,
	): this
	on(event: 'testLifecycle', listener: (record: TestLifecycle) => void): this
	on(event: 'testStepError', listener: (err: TestStepError) => void): this
	on(event: 'testScriptConsole', listener: (msg: { method: string; args: any[] }) => void): this
}

export class EventEmitterReporter extends EventEmitter implements IReporter {
	public responseCode: string = '200'
	public stepName: string

	reset(stepName: string): void {
		this.stepName = stepName
		this.responseCode = '200'
	}

	addMeasurement(measurement: string, value: string | number, label?: string): void {
		label = expect(
			label || this.stepName,
			`Label must be present when writing "${measurement}" measurement`,
		)
		this.emit('measurement', {
			measurement,
			value: value.toString(),
			label,
			responseCode: this.responseCode,
		})
	}

	addCompoundMeasurement(
		measurement: MeasurementKind,
		value: CompoundMeasurement,
		label: string,
	): void {
		label = expect(
			label || this.stepName,
			`Label must be present when writing ${measurement} measurement`,
		)
		this.emit('compoundMeasurement', {
			measurement,
			value,
			label,
			responseCode: this.responseCode,
		})
	}

	async flushMeasurements(): Promise<void> {}

	addTrace(traceData: TraceData, label: string): void {
		label = expect(label || this.stepName, `Label must be present when writing trace measurement`)
		this.emit('trace', label, this.responseCode, traceData)
	}

	testLifecycle(event: TestEvent, label: string): void {
		this.emit('testLifecycle', { label, event })
	}

	testStepError(error: Error): void {
		this.emit('testStepError', { step: this.stepName, error })
	}

	testAssertionError(error: TestScriptError): void {
		this.emit('testAssertionError', { step: this.stepName, error })
	}

	testInternalError(message: string, error: Error): void {
		this.emit('testInternalError', { message, step: this.stepName, error })
	}

	testScriptConsole(method: string, message?: any, ...args: any[]): void {
		if (message !== undefined) {
			args.unshift(message)
		}
		this.emit('testScriptConsole', { method, args })
	}
}

export default EventEmitterReporter
