import {
	IReporter,
	TraceData,
	TestEvent,
	CompoundMeasurement,
	MeasurementKind,
} from '@flood/element/lib/ReporterAPI'
import { TestScriptError } from '@flood/element/TestScriptAPI'
import { Logger } from 'winston'
import chalk from 'chalk'

export class ConsoleReporter implements IReporter {
	public responseCode: string
	public stepName: string
	public verbose: boolean = false

	constructor(private logger: Logger) {
		// TODO Get from flag
		this.verbose = !!process.env.VERBOSE
	}

	reset(step: string): void {}

	addMeasurement(measurement: string, value: string | number, label?: string): void {
		this.logger.debug(`> ${measurement} ${value}`)
	}

	addCompoundMeasurement(
		measurement: MeasurementKind,
		value: CompoundMeasurement,
		label: string,
	): void {
		this.logger.debug(`> ${measurement} ${JSON.stringify(value)}`)
	}

	addTrace(traceData: TraceData, label: string): void {
		this.logger.debug(`> trace:\n${JSON.stringify(traceData)}`)
	}

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
				this.logger.info(`---- Step '${label}' skipped`)
				break
		}
	}

	testInternalError(message: string, err: Error): void {
		this.logger.error('flood-element error:\n' + err)
	}
	testAssertionError(err: TestScriptError): void {
		this.logger.error('assertion failed \n' + err.toStringNodeFormat())
	}
	testStepError(err: TestScriptError): void {
		const detail = err.toDetailObject(this.verbose)

		let str = detail.callsite + '\n\n'

		if (detail.callContext) {
			str += 'in call ' + chalk.blue(detail.callContext) + '():\n'
		}

		str += detail.asString + '\n' + detail.unmappedStack.join('\n')

		if (detail.doc) {
			str += '\n\nDetail:\n' + detail.doc + '\n'
		}

		this.logger.error('\n' + str)

		if (this.verbose) {
			this.logger.error(`Verbose detail: 
cause.asString(): ${detail.causeAsString}
cause.stack: ${detail.causeStack}`)
		}
	}

	testScriptConsole(method: string, message?: any, ...optionalParams: any[]): void {
		if (method == 'log') method = 'info'
		this.logger[method](message, ...optionalParams)
	}
}
