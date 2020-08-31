import { Test } from './testTypes'
import { TestObserver } from './TestObserver'
import { Step } from '../Step'
import { TestEvent } from '../../Reporter'
import { StructuredError } from '../../utils/StructuredError'
import { TimingObserver } from './TimingObserver'

export default class LifecycleObserver implements TestObserver {
	constructor(public next: TestObserver) {}
	async before(test: Test) {
		test.reporter.testLifecycle(TestEvent.BeforeTest, 'test')
		return this.next.before(test)
	}

	async after(test: Test) {
		await this.next.after(test)

		if (test.failed) {
			test.reporter.testLifecycle(TestEvent.TestFailed, 'test')
		} else {
			test.reporter.testLifecycle(TestEvent.TestSucceeded, 'test')
		}

		test.reporter.testLifecycle(TestEvent.AfterTest, 'test')
	}

	async beforeStep(test: Test, step: Step) {
		test.reporter.testLifecycle(TestEvent.BeforeStep, step.name)
		return this.next.beforeStep(test, step)
	}
	async onStepPassed(test: Test, step: Step) {
		await this.next.onStepPassed(test, step)
		test.reporter.testLifecycle(TestEvent.StepSucceeded, step.name)
	}
	async onStepError(test: Test, step: Step, error: StructuredError<any>) {
		await this.next.onStepError(test, step, error)
		test.reporter.testLifecycle(TestEvent.StepFailed, step.name)
	}
	async onStepSkipped(test: Test, step: Step) {
		await this.next.onStepSkipped(test, step)
		test.reporter.testLifecycle(TestEvent.StepSkipped, step.name)
	}
	async afterStep(test: Test, step: Step) {
		const testObserver: TestObserver = this.next
		await testObserver.afterStep(test, step)
		const timing = await (testObserver as TimingObserver).getMeasurementTime(
			test.settings.responseTimeMeasurement,
		)
		test.reporter.testLifecycle(TestEvent.AfterStep, step.name, timing)
	}

	async beforeStepAction(test: Test, step: Step, command: string) {
		test.reporter.testLifecycle(TestEvent.BeforeStepAction, command)
		return this.next.beforeStepAction(test, step, command)
	}
	async afterStepAction(test: Test, step: Step, command: string) {
		await this.next.afterStepAction(test, step, command)
		test.reporter.testLifecycle(TestEvent.AfterStepAction, command)
	}
}
