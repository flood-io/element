/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { TestScriptError } from '../runtime/TestScriptError'
import { IReporter, WorkerReport } from '../runtime/IReporter'
import { TraceData, TestEvent, CompoundMeasurement, MeasurementKind } from '../types/Report'
import chalk from 'chalk'
import debugFactory from 'debug'
import { CustomConsole } from '../console/CustomConsole'
import { ReportUtils } from '../utils/ReportUtils'
import Spinnies from 'spinnies'
const debug = debugFactory('element-cli:console-reporter')

export class BaseReporter implements IReporter {
	public responseCode: string
	public stepName: string
	public worker: WorkerReport
	public report: ReportUtils

	constructor(public spinnies?: Spinnies) {
		this.report = new ReportUtils(spinnies)
	}

	reset(step: string): void {}

	addMeasurement(measurement: string, value: string | number): void {}

	addCompoundMeasurement(
		measurement: MeasurementKind,
		value: CompoundMeasurement,
		label: string
	): void {}

	addTrace(traceData: TraceData, label: string): void {}

	async flushMeasurements(): Promise<void> {}

	testLifecycle(
		stage: TestEvent,
		label: string,
		subtitle?: string,
		timing?: number,
		errorMessage?: string
	): void {
		const stepName = 'Step ' + (subtitle ? `'${label}' (${subtitle})` : `'${label}'`)
		const beforeRunStepMessage = chalk.whiteBright(`${stepName} is running ...`)
		const beforeRunHookMessage = chalk.whiteBright(`${label} is running ...`)
		const afterRunHookMessage = `${chalk.green.bold('✔')} ${chalk.whiteBright(`${label} finished`)}`
		const customConsole = global.console as CustomConsole
		customConsole.setGroupDepth(6)
		switch (stage) {
			case TestEvent.BeforeAllStep:
			case TestEvent.AfterAllStep:
			case TestEvent.BeforeEachStep:
			case TestEvent.AfterEachStep:
				this.report.startAnimation(label, beforeRunHookMessage, 4)
				break
			case TestEvent.BeforeAllStepFinished:
			case TestEvent.AfterAllStepFinished:
			case TestEvent.BeforeEachStepFinished:
			case TestEvent.AfterEachStepFinished:
				this.report.endAnimation(label, afterRunHookMessage, 4)
				break
			case TestEvent.BeforeStep:
				this.report.startAnimation(stepName, beforeRunStepMessage, 4)
				break
			case TestEvent.StepSucceeded:
				this.report.endAnimation(stepName, `${stepName} passed (${timing?.toLocaleString()}ms)`, 4)
				break
			case TestEvent.StepFailed:
				console.error(chalk.red(errorMessage?.length ? errorMessage : 'step error -> failed'))
				this.report.endAnimation(
					stepName,
					chalk.red(`${stepName} failed (${timing?.toLocaleString()}ms)`),
					4,
					'fail'
				)
				break
			case TestEvent.StepSkipped:
				this.report.addText(stepName, chalk.yellow(`${stepName} skipped`), 4)
				break
			case TestEvent.StepUnexecuted:
				this.report.addText(stepName, chalk.grey(`${stepName} is unexecuted`), 4)
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
			case 'clear':
				break
			case 'log':
			default:
				console.log(logMessage)
				break
		}
	}
}
