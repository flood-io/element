import {
	IReporter,
	TraceData,
	TestEvent,
	CompoundMeasurement,
	MeasurementKind,
} from './../Reporter'
import { TestScriptError } from './../TestScript'

type ConsoleMethod = keyof Console

export class ConsoleReporter implements IReporter {
	public responseCode: string
	public stepName: string

	reset(step: string): void {}

	addMeasurement(measurement: string, value: string | number, label?: string): void {}

	addCompoundMeasurement(
		measurement: MeasurementKind,
		value: CompoundMeasurement,
		label: string,
	): void {}

	addTrace(traceData: TraceData, label: string): void {}

	async flushMeasurements(): Promise<void> {}

	testLifecycle(event: TestEvent, label: string): void {}

	testInternalError(message: string, err: Error): void {}
	testAssertionError(err: TestScriptError): void {}
	testStepError(err: TestScriptError): void {}

	testScriptConsole(method: ConsoleMethod, message?: any, ...optionalParams: any[]): void {
		if (method in console) {
			console[method](message, ...optionalParams)
		}
	}
}
