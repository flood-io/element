import { TestScriptError } from '../runtime/TestScriptError'
import { IReporter } from '../runtime/IReporter'
import { TraceData, TestEvent, CompoundMeasurement, MeasurementKind } from '../types/Report'
import chalk from 'chalk'
import { Logger } from 'winston'
import { createTestLog } from '../utils/TestLogger'
const debug = require('debug')('element-cli:console-reporter')
//const ansiEscapes = require('ansi-escapes')

export class VerboseReporter implements IReporter {
	public responseCode: string
	public stepName: string
	public logger: Logger

	constructor(private verbose: boolean) {
		const logLevel = verbose ? 'debug' : 'info'
		this.logger = createTestLog(logLevel, true)
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

	testLifecycle(stage: TestEvent, label: string, timing?: number): void {
		switch (stage) {
			case TestEvent.AfterStepAction:
				console.log(`---> ${label}()\n`)
				break
			case TestEvent.BeforeStep:
				console.log(`===> Step '${label}'\n`)
				break
			case TestEvent.AfterStep:
				console.log(`---> Step '${label}' finished in ${timing?.toLocaleString()}ms\n`)
				break
			case TestEvent.StepSkipped:
				console.log(`---- Step '${label}' skipped\n`)
				break
			case TestEvent.StepFailed:
				console.log(`xxxx Step '${label}' failed\n`)
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
		if (method === 'log') method = 'info'
		if (method === 'warning') method = 'warn'
		;(this.logger as any)[method](`page console.${method}: ${message} ${optionalParams.join(' ')}`)
	}
}
