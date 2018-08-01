import Test, { TestObserver } from '../Test'
import { Step } from '../Step'
import { TestEvent } from '../../Reporter'

export default class LifecycleObserver implements TestObserver {
	constructor(private testTiming: Timing) {}
	async before(test: Test) {
		test.reporter.testLifecycle(TestEvent.BeforeTest, 'test')
	}

	async after(test: Test) {
		if (test.failed) {
			test.reporter.testLifecycle(TestEvent.TestFailed, 'test')
		} else {
			test.reporter.testLifecycle(TestEvent.TestSucceeded, 'test')
		}

		test.reporter.testLifecycle(TestEvent.AfterTest, 'test')
	}

	async beforeStep(test: Test, step: Step) {
		test.reporter.testLifecycle(TestEvent.BeforeStep, step.name)
	}
	async onStepPassed(test: Test, step: Step) {
		test.reporter.testLifecycle(TestEvent.StepSucceeded, step.name)
	}
	async onStepError(test: Test, step: Step, error: Error) {
		test.reporter.testLifecycle(TestEvent.StepFailed, step.name)
	}
	async onStepSkipped(test: Test, step: Step) {
		test.reporter.testLifecycle(TestEvent.StepSkipped, step.name)
	}
	async afterStep(test: Test, step: Step) {
		test.reporter.testLifecycle(TestEvent.AfterStep, step.name)
	}

	async beforeStepAction(test: Test, step: Step, command: string) {
		test.reporter.testLifecycle(TestEvent.BeforeStepAction, command)
	}
	async afterStepAction(test: Test, step: Step, command: string) {
		test.reporter.testLifecycle(TestEvent.AfterStepAction, command)
	}
}
