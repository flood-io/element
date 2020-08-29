import { TestScriptError } from '../runtime/TestScriptError'
import { IReporter } from '../runtime/IReporter'
import { TraceData, TestEvent, CompoundMeasurement, MeasurementKind } from '../types/Report'
import chalk from 'chalk'
import { Logger } from 'winston'
import { createTestLog } from '../utils/TestLogger'
import ansiEscapes from 'ansi-escapes'
const debug = require('debug')('element-cli:console-reporter')

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
		console.debug(`> ${measurement} ${JSON.stringify(value)}`)
	}

	addTrace(traceData: TraceData, label: string): void {
		console.debug(`> trace:\n${JSON.stringify(traceData)}`)
	}

	async flushMeasurements(): Promise<void> {}

	testLifecycle(
		stage: TestEvent,
		label: string,
		subtitle?: string,
		timing?: number,
		errorMessage?: string,
	): void {
		const stepName = 'Step ' + (subtitle ? `'${label}' (${subtitle})` : `'${label}'`)
		switch (stage) {
			case TestEvent.AfterStepAction:
				console.log(chalk.grey(`${label}()`))
				break
			case TestEvent.BeforeStep:
				console.group(chalk.grey(`${stepName} is running ...`))
				console.group()
				break
			case TestEvent.StepSucceeded:
				process.stdout.write(ansiEscapes.cursorUp(12) + ansiEscapes.eraseLine)
				console.groupEnd()
				console.log(
					chalk.green.bold('✔'),
					chalk.grey(`${stepName} passed (${timing?.toLocaleString()}ms)`),
				)
				process.stdout.write(ansiEscapes.cursorDown(12))
				break
			case TestEvent.StepFailed:
				console.error(chalk.red(errorMessage ?? 'step error -> failed'))
				console.groupEnd()
				console.log(chalk.redBright.bold('✘'), chalk.grey(`${stepName} failed`))
				break
			case TestEvent.AfterStep:
				console.groupEnd()
				break
		}
	}

	testInternalError(message: string, err: Error): void {
		console.error('flood-element error:\n' + err)
	}
	testAssertionError(err: TestScriptError): void {
		console.error('assertion failed \n' + err.toStringNodeFormat())
	}
	testStepError(err: TestScriptError): void {
		const detail = err.toDetailObject(this.verbose)
		if (detail.callsite) {
			console.error(detail.callsite)
		}
	}

	testScriptConsole(method: string, message?: any, ...optionalParams: any[]): void {
		debug('testScriptConsole', method, message)
		const logMessage = `${message} ${optionalParams.join(' ')}`
		switch (method) {
			case 'info':
				console.log(chalk.green(logMessage))
				break
			case 'debug':
				console.log(chalk.blue(logMessage))
				break
			case 'warn':
			case 'warning':
				console.log(chalk.yellow(logMessage))
				break
			case 'error':
				console.log(chalk.red(logMessage))
				break
			case 'log':
			default:
				console.log(logMessage)
				break
		}
	}
}
