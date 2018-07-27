import {
	IReporter,
	TraceData,
	TestEvent,
	CompoundMeasurement,
	MeasurementKind,
} from '@flood/element/ReporterAPI'
import { TestScriptError } from '@flood/element/TestScriptAPI'
import { Logger } from 'winston'

export class ConsoleReporter implements IReporter {
	public responseCode: string
	public stepName: string

	constructor(private logger: Logger) {}

	reset(step: string): void {}

	addMeasurement(measurement: string, value: string | number, label?: string): void {
		this.logger.debug(`> ${label} ${measurement} ${value}`)
	}

	addCompoundMeasurement(
		measurement: MeasurementKind,
		value: CompoundMeasurement,
		label: string,
	): void {
		this.logger.debug(`> ${label} ${measurement} ${JSON.stringify(value)}`)
	}

	addTrace(traceData: TraceData, label: string): void {}

	async flushMeasurements(): Promise<void> {}

	testLifecycle(stage: TestEvent, label: string): void {
		switch (stage) {
			case TestEvent.AfterStepAction:
				this.logger.info(`---> ${label}()`)
				break
			case TestEvent.BeforeStep:
				this.logger.info(`===> Step '${label}'`)
				break
			case TestEvent.AfterStep:
				this.logger.info(`---> Step '${label}' finished`)
				break
			case TestEvent.StepSkipped:
				this.logger.info(`---- Step '${label}'`)
				break
		}
	}

	testInternalError(message: string, err: Error): void {}
	testAssertionError(err: TestScriptError): void {}
	testStepError(err: TestScriptError): void {}

	testScriptConsole(method: string, message?: any, ...optionalParams: any[]): void {
		if (method == 'log') method = 'info'
		this.logger[method](message, ...optionalParams)
	}
}
