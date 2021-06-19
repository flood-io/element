import { parentPort } from 'worker_threads'
import chalk from 'chalk'
import { WorkerReport } from '../runtime/IReporter'
import { BaseReporter } from './Base'
import { TestEvent } from '../types/Report'

export class MultipleUsersReporter extends BaseReporter {
	public worker: WorkerReport

	addMeasurement(measurement: string, value: string | number): void {
		this.sendReport(
			JSON.stringify({ name: measurement, value, iteration: this.worker.iteration }),
			'measurement'
		)
	}

	setWorker(worker: WorkerReport): void {
		this.worker = worker
	}

	sendReport(msg: string, logType: string): void {
		if (parentPort) {
			parentPort.postMessage([0, 'report', [msg, logType]])
		}
	}

	testLifecycle(
		stage: TestEvent,
		label: string,
		subtitle?: string,
		timing?: number,
		errorMessage?: string
	): void {
		const stepName = 'Step ' + (subtitle ? `'${label}' (${subtitle})` : `'${label}'`)
		switch (stage) {
			case TestEvent.AfterEachStep:
				this.sendReport(`${label} is running ...`, 'action')
				break
			case TestEvent.AfterEachStepFinished:
				this.sendReport(`${chalk.green.bold('✔')} ${chalk.grey(`${label} finished`)}`, 'action')
				break
			case TestEvent.BeforeStep:
				this.sendReport(`${stepName} is running ...`, 'action')
				break
			case TestEvent.StepSucceeded:
				this.sendReport(`${stepName} passed (${timing?.toLocaleString()}ms)`, 'action')
				break
			case TestEvent.StepFailed:
				this.sendReport(
					`${stepName} failed (${timing?.toLocaleString()}ms) -> ${chalk.red(errorMessage || '')}`,
					'action'
				)
				break
		}
	}
}
