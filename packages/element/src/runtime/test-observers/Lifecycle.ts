import Test from '../Test'
import { TestObserver } from './Observer'
import { Step } from '../Step'
import { TestEvent } from '../../Reporter'
import { ClassifiedError } from '../errors/Error'

export default class LifecycleObserver implements TestObserver {
	constructor(private next: TestObserver) {}
	async before(test: Test) {
		test.reporter.testLifecycle(TestEvent.BeforeTest, 'test')
		return this.next.before(test)
	}

	async after(test: Test) {
		if (test.failed) {
			test.reporter.testLifecycle(TestEvent.TestFailed, 'test')
		} else {
			test.reporter.testLifecycle(TestEvent.TestSucceeded, 'test')
		}

		test.reporter.testLifecycle(TestEvent.AfterTest, 'test')
		return this.next.after(test)
	}

	async beforeStep(test: Test, step: Step) {
		test.reporter.testLifecycle(TestEvent.BeforeStep, step.name)
		return this.next.beforeStep(test, step)
	}
	async onStepPassed(test: Test, step: Step) {
		test.reporter.testLifecycle(TestEvent.StepSucceeded, step.name)
		return this.next.onStepPassed(test, step)
	}
	async onStepError(test: Test, step: Step, error: ClassifiedError) {
		test.reporter.testLifecycle(TestEvent.StepFailed, step.name)
		return this.next.onStepError(test, step, error)
	}
	async onStepSkipped(test: Test, step: Step) {
		test.reporter.testLifecycle(TestEvent.StepSkipped, step.name)
		return this.next.onStepSkipped(test, step)
	}
	async afterStep(test: Test, step: Step) {
		test.reporter.testLifecycle(TestEvent.AfterStep, step.name)
		return this.next.afterStep(test, step)
	}

	async beforeStepAction(test: Test, step: Step, command: string) {
		test.reporter.testLifecycle(TestEvent.BeforeStepAction, command)
		return this.next.beforeStepAction(test, step, command)
	}
	async afterStepAction(test: Test, step: Step, command: string) {
		test.reporter.testLifecycle(TestEvent.AfterStepAction, command)
		return this.next.afterStepAction(test, step, command)
	}
}
