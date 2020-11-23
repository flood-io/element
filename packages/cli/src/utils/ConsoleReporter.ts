import {
	IReporter,
	TraceData,
	TestEvent,
	CompoundMeasurement,
	MeasurementKind,
	TestScriptError,
} from '@flood/element-core'
import { Logger } from 'winston'
import chalk from 'chalk'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const debug = require('debug')('element-cli:console-reporter')

export class ConsoleReporter implements IReporter {
	public responseCode: string
	public stepName: string

	constructor(private logger: Logger, private verbose: boolean) {}

	reset(step: string): void {
		debug(`reset ${step}`)
	}

	addMeasurement(measurement: string, value: string | number, label?: string): void {
		this.logger.debug(`> ${measurement} ${value} ${label}`)
	}

	addCompoundMeasurement(
		measurement: MeasurementKind,
		value: CompoundMeasurement,
		label: string,
	): void {
		this.logger.debug(`> ${measurement} ${JSON.stringify(value)}, label: ${label}`)
	}

	addTrace(traceData: TraceData, label: string): void {
		this.logger.debug(`> trace:\n${JSON.stringify(traceData)}, label: ${label}`)
	}

	async flushMeasurements(): Promise<void> {}

	testLifecycle(stage: TestEvent, label: string, timing?: number): void {
		switch (stage) {
			case TestEvent.AfterStepAction:
				this.logger.info(`---> ${label}()`)
				break
			case TestEvent.BeforeStep:
				this.logger.info('')
				this.logger.info(`===> Step '${label}'`)
				break
			case TestEvent.AfterStep:
				this.logger.info(`---> Step '${label}' finished in ${timing?.toLocaleString()}ms`)
				break
			case TestEvent.StepSkipped:
				this.logger.info(`---- Step '${label}' skipped`)
				break
			case TestEvent.StepFailed:
				this.logger.error(`xxxx Step '${label}' failed`)
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
		debug('testScriptConsole', method, message)
		if (method === 'clear') return
		if (method === 'log') method = 'info'
		if (method === 'warning') method = 'warn'
		const consolMethod = this.logger[method] || console.info
		consolMethod(`page console.${method}: ${message} ${optionalParams.join(' ')}`)
	}
}
