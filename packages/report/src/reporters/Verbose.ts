import { TestScriptError } from '../runtime/TestScriptError'
import { IReporter } from '../runtime/IReporter'
import { TraceData, TestEvent, CompoundMeasurement, MeasurementKind } from '../types/Report'
import chalk from 'chalk'
import ansiEscapes from 'ansi-escapes'
import { ReportCache } from './Cache'
const debug = require('debug')('element-cli:console-reporter')

export class VerboseReporter implements IReporter {
	public responseCode: string
	public stepName: string
	constructor(private cache: ReportCache) {}
	reset(step: string): void {}

	addMeasurement(measurement: string, value: string | number, label?: string): void {}

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
		content?: any[],
	): void {
		const stepName = 'Step ' + (subtitle ? `'${label}' (${subtitle})` : `'${label}'`)
		const beforeRunStepMessage = `${stepName} is running ...`
		const beforeRunHookMessage = chalk.grey(`${label} is running ...`)
		const afterRunHookMessage = `${chalk.green.bold('✔')} ${chalk.grey(`${label} finished`)}`
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
				console.group(chalk.grey(beforeRunStepMessage))
				console.group()
				break
			case TestEvent.AfterStepAction:
				console.log(chalk.grey(`${label}()`))
				break
			case TestEvent.StepSucceeded:
				message = `${chalk.green.bold('✔')} ${chalk.grey(
					`${stepName} passed (${timing?.toLocaleString()}ms)`,
				)}`
				this.updateMessage(beforeRunStepMessage, message)
				break
			case TestEvent.StepFailed:
				message = `${chalk.red.bold('✘')} ${chalk.grey(`${stepName} failed`)}`
				console.error(chalk.red(errorMessage?.length ? errorMessage : 'step error -> failed'))
				this.updateMessage(beforeRunStepMessage, message)
				break
			case TestEvent.AfterStep:
				console.groupEnd()
				break
			case TestEvent.StepSkipped:
				console.group(`${chalk.grey.bold('\u2296')} ${chalk.grey(`${stepName} skipped`)}`)
				console.groupEnd()
				break
			case TestEvent.StepUnexecuted:
				console.group(`${chalk.grey.bold('\u2296')} ${chalk.grey(`${stepName} is unexecuted`)}`)
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
		const detail = err.toDetailObject(true)
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

	private updateMessage(previousMessage: string, newMessage: string): void {
		const lines: number = this.cache.getLinesBetweenCurrentAndPreviousMessage(previousMessage)
		process.stdout.write(ansiEscapes.cursorUp(lines) + ansiEscapes.eraseLine)
		console.groupEnd()
		console.log(newMessage)
		this.cache.updateMessageInCache(previousMessage, newMessage)
		process.stdout.write(ansiEscapes.cursorDown(lines) + ansiEscapes.eraseLine)
	}
}
