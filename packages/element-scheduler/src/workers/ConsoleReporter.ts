import {
	IReporter,
	TraceData,
	TestEvent,
	CompoundMeasurement,
	MeasurementKind,
	TestScriptError,
} from '@flood/element-report'
import { Logger } from 'winston'
import chalk from 'chalk'

export class ConsoleReporter implements IReporter {
	public responseCode: string
	public stepName: string

	constructor(private logger: Logger, private verbose: boolean, private workerName: string) {}

	reset(step: string): void {}

	addMeasurement(measurement: string, value: string | number, label?: string): void {
		this.logger.debug(`[${this.workerName}] > ${measurement} ${value}`)
	}

	addCompoundMeasurement(
		measurement: MeasurementKind,
		value: CompoundMeasurement,
		label: string,
	): void {
		this.logger.debug(`[${this.workerName}] > ${measurement} ${JSON.stringify(value)}`)
	}

	addTrace(traceData: TraceData, label: string): void {
		this.logger.debug(`[${this.workerName}] > trace:\n${JSON.stringify(traceData)}`)
	}

	sendReport(msg: string, logType: string): void {
		this.logger.debug(`> [ConsoleReporter] sendReport: msg: ${msg}, type: ${logType}`)
	}

	async flushMeasurements(): Promise<void> {}

	testLifecycle(stage: TestEvent, label: string, subTitle?: string, timing?: number): void {
		switch (stage) {
			case TestEvent.AfterStepAction:
				this.logger.info(`[${this.workerName}]: ---> ${label}()`)
				break
			case TestEvent.BeforeStep:
				this.logger.info('')
				this.logger.info(`[${this.workerName}]: ===> Step '${label}'`)
				break
			case TestEvent.AfterStep:
				this.logger.info(
					`[${this.workerName}]: ---> Step '${label}' finished in ${timing?.toLocaleString()}ms`,
				)
				break
			case TestEvent.StepSkipped:
				this.logger.info(`[${this.workerName}]: ---- Step '${label}' skipped`)
				break
			case TestEvent.StepFailed:
				this.logger.error(`[${this.workerName}]: xxxx Step '${label}' failed`)
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

		let str = detail.callSite + '\n\n'

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
		if (method === 'clear') return
		if (method === 'log') method = 'info'
		if (method === 'warning') method = 'warn'
		;(this.logger as any)[method](`page console.${method}: ${message} ${optionalParams.join(' ')}`)
	}
}
