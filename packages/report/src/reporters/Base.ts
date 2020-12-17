/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import { TestScriptError } from '../runtime/TestScriptError'
import { IReporter, WorkerReport } from '../runtime/IReporter'
import { TraceData, TestEvent, CompoundMeasurement, MeasurementKind } from '../types/Report'
import chalk from 'chalk'
import { ReportCache } from './Cache'
import ansiEscapes from 'ansi-escapes'
const debug = require('debug')('element-cli:console-reporter')

export class BaseReporter implements IReporter {
	public responseCode: string
	public stepName: string
	public worker: WorkerReport

	constructor(protected cache: ReportCache) {}

	reset(step: string): void {}

	addMeasurement(measurement: string, value: string | number): void {}

	addCompoundMeasurement(
		measurement: MeasurementKind,
		value: CompoundMeasurement,
		label: string,
	): void {}

	addTrace(traceData: TraceData, label: string): void {}

	async flushMeasurements(): Promise<void> {}

	testLifecycle(
		stage: TestEvent,
		label: string,
		subtitle?: string,
		timing?: number,
		errorMessage?: string,
	): void {
		const stepName = 'Step ' + (subtitle ? `'${label}' (${subtitle})` : `'${label}'`)
		const beforeRunStepMessage = chalk.whiteBright(`${stepName} is running ...`)
		const beforeRunHookMessage = chalk.whiteBright(`${label} is running ...`)
		const afterRunHookMessage = `${chalk.green.bold('✔')} ${chalk.whiteBright(`${label} finished`)}`
		let message = ''
		switch (stage) {
			case TestEvent.BeforeAllStep:
			case TestEvent.AfterAllStep:
			case TestEvent.BeforeEachStep:
			case TestEvent.AfterEachStep:
				console.group(beforeRunHookMessage)
				console.group()
				break
			case TestEvent.BeforeAllStepFinished:
			case TestEvent.AfterAllStepFinished:
			case TestEvent.BeforeEachStepFinished:
			case TestEvent.AfterEachStepFinished:
				this.updateMessage(beforeRunHookMessage, afterRunHookMessage)
				console.groupEnd()
				break
			case TestEvent.BeforeStep:
				console.group(beforeRunStepMessage)
				console.group()
				break
			case TestEvent.StepSucceeded:
				message = `${chalk.green.bold('✔')} ${chalk.green(
					`${stepName} passed (${timing?.toLocaleString()}ms)`,
				)}`
				this.updateMessage(beforeRunStepMessage, message)
				break
			case TestEvent.StepFailed:
				message = `${chalk.redBright.bold('✘')} ${chalk.red(
					`${stepName} failed (${timing?.toLocaleString()}ms)`,
				)}`
				console.error(chalk.red(errorMessage?.length ? errorMessage : 'step error -> failed'))
				this.updateMessage(beforeRunStepMessage, message)
				console.log('')
				break
			case TestEvent.StepSkipped:
				console.group(`${chalk.yellow.bold('\u2296')} ${chalk.yellow(`${stepName} skipped`)}`)
				console.log('')
				console.groupEnd()
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
		const detail = err.toDetailObject(false)
		if (detail.callSite) {
			console.error(detail.callSite)
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
	private updateMessage(previousMessage: string, newMessage: string): void {
		const lines: number = this.cache.getLinesBetweenCurrentAndPreviousMessage(previousMessage)
		process.stdout.write(ansiEscapes.cursorUp(lines) + ansiEscapes.eraseLine)
		console.groupEnd()
		console.log(newMessage)
		this.cache.updateMessageInCache(previousMessage, newMessage)
		process.stdout.write(ansiEscapes.cursorDown(lines) + ansiEscapes.eraseLine)
	}
}
