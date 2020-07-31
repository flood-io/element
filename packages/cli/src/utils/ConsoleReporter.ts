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
const debug = require('debug')('element-cli:console-reporter')

export class ConsoleReporter implements IReporter {
	public responseCode: string
	public stepName: string

	constructor(private logger: Logger, private verbose: boolean) {}

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

	testLifecycle(stage: TestEvent, label: string, subtitle?: string, timing?: number): void {
		const stepName = subtitle ? `'${label}' (${subtitle})` : `'${label}'`
		switch (stage) {
			case TestEvent.StepSucceeded:
				console.log(
					chalk.green.bold('✔'),
					chalk.grey(`Step ${stepName} passed ${timing?.toLocaleString()}ms)`),
				)
				break
			case TestEvent.StepFailed:
				console.log(chalk.redBright.bold('✘'), chalk.grey(`Step ${stepName} failed`))
				break
		}
	}

	testInternalError(message: string, err: Error): void {
		this.logger.debug('flood-element error:\n' + err)
	}
	testAssertionError(err: TestScriptError): void {
		this.logger.debug('assertion failed \n' + err.toStringNodeFormat())
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

		this.logger.debug('\n' + str)

		if (this.verbose) {
			this.logger.debug(`Verbose detail:
cause.asString(): ${detail.causeAsString}
cause.stack: ${detail.causeStack}`)
		}
	}

	testScriptConsole(method: string, message?: any, ...optionalParams: any[]): void {
		debug('testScriptConsole', method, message)
		if (method === 'log') method = 'info'
		if (method === 'warning') method = 'warn'
		;(this.logger as any)[method](`page console.${method}: ${message} ${optionalParams.join(' ')}`)
	}
}
