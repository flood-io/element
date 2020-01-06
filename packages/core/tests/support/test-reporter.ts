import { IReporter, TraceData, TestEvent } from '../../src/Reporter'
import { TestScriptError } from '../../src/TestScript'

export default class TestReporter implements IReporter {
	public measurements: {
		measurement: string
		value: string | object
		label: string
		responseCode: string
	}[] = []
	public traces: TraceData[] = []

	public stepName: string
	public responseCode: string = '200'

	reset(stepName: string): void {
		this.stepName = stepName
		this.responseCode = '200'
	}

	addMeasurement(measurement: string, value: string): void {
		this.measurements.push({
			measurement,
			value,
			label: this.stepName,
			responseCode: this.responseCode,
		})
	}

	addCompoundMeasurement(measurement: string, value: object, label: string): void {
		this.measurements.push({ measurement, value, label, responseCode: this.responseCode })
	}

	addTrace(traceData: TraceData): void {
		this.traces.push(traceData)
	}

	async flushMeasurements(): Promise<void> {}

	testLifecycle(event: TestEvent, label: string): void {}

	testAssertionError(err: TestScriptError): void {}
	testStepError(err: TestScriptError): void {}
	testInternalError(message: string, err: Error): void {}

	testScriptConsole(method: string, message?: any, ...optionalParams: any[]): void {
		;(console as any)[method](message, ...optionalParams)
	}
}
