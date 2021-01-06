import { TestScriptError } from '../runtime/TestScriptError'
import { IReporter, WorkerReport } from '../runtime/IReporter'
import { TraceData, TestEvent, CompoundMeasurement, MeasurementKind } from '../types/Report'
import chalk from 'chalk'
import debugFactory from 'debug'
const debug = debugFactory('element-cli:console-reporter')

export class BaseReporter implements IReporter {
	public responseCode: string
	public stepName: string
	public worker: WorkerReport

	constructor(public spinnies?: any) {}

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
		switch (stage) {
			case TestEvent.BeforeAllStep:
			case TestEvent.AfterAllStep:
			case TestEvent.BeforeEachStep:
			case TestEvent.AfterEachStep:
				this.spinnies.add(label, { text: beforeRunHookMessage, indent: 4 })
				break
			case TestEvent.BeforeAllStepFinished:
			case TestEvent.AfterAllStepFinished:
			case TestEvent.BeforeEachStepFinished:
			case TestEvent.AfterEachStepFinished:
				this.spinnies.succeed(label, { text: afterRunHookMessage, indent: 4 })
				break
			case TestEvent.BeforeStep:
				this.spinnies.add(stepName, { text: beforeRunStepMessage, indent: 4 })
				break
			case TestEvent.StepSucceeded:
				this.spinnies.succeed(stepName, {
					text: `${stepName} passed (${timing?.toLocaleString()}ms)`,
					indent: 4,
				})
				break
			case TestEvent.StepFailed:
				console.error(chalk.red(errorMessage?.length ? errorMessage : 'step error -> failed'))
				this.spinnies.fail(stepName, {
					text: `${stepName} failed (${timing?.toLocaleString()}ms)`,
					indent: 4,
				})
				break
			case TestEvent.StepSkipped:
				this.spinnies.add(stepName, {
					text: chalk.yellow(`${stepName} skipped`),
					status: 'non-spinnable',
					indent: 4,
				})
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
}
