import { Test } from './testTypes'
import { TestObserver } from './TestObserver'
import { Step } from '../Step'
import { TestEvent } from '@flood/element-report'
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
		test.reporter.testLifecycle(TestEvent.BeforeStep, step.name, step.subTitle)
		return this.next.beforeStep(test, step)
	}
	async onStepPassed(test: Test, step: Step) {
		const testObserver: TestObserver = this.next
		await testObserver.afterStep(test, step)
		const timing = await (testObserver as TimingObserver).getMeasurementTime(
			test.settings.responseTimeMeasurement,
		)
		test.reporter.testLifecycle(TestEvent.StepSucceeded, step.name, step.subTitle, timing)
		step.duration = timing
	}
	async onStepError(test: Test, step: Step, error: StructuredError<any>) {
		await this.next.onStepError(test, step, error)
		test.reporter.testLifecycle(TestEvent.StepFailed, step.name, step.subTitle, 0, error?.message)
	}
	async onStepSkipped(test: Test, step: Step) {
		await this.next.onStepSkipped(test, step)
		test.reporter.testLifecycle(TestEvent.StepSkipped, step.name)
	}

	async onStepUnexecuted(test: Test, step: Step) {
		await this.next.onStepUnexecuted(test, step)
		test.reporter.testLifecycle(TestEvent.StepUnexecuted, step.name)
	}
	async afterStep(test: Test, step: Step) {
		await this.next.afterStep(test, step)
		test.reporter.testLifecycle(TestEvent.AfterStep, step.name)
	}

	async beforeStepAction(test: Test, step: Step, command: string) {
		await this.next.beforeStepAction(test, step, command)
		test.reporter.testLifecycle(TestEvent.BeforeStepAction, command)
	}
	async afterStepAction(test: Test, step: Step, command: string) {
		await this.next.afterStepAction(test, step, command)
		test.reporter.testLifecycle(TestEvent.AfterStepAction, command, '', 0, '')
	}

	async beforeAllStep(test: Test): Promise<void> {
		await this.next.beforeAllStep(test)
		test.reporter.testLifecycle(TestEvent.BeforeAllStep, 'beforeAll')
	}
	async afterAllStep(test: Test): Promise<void> {
		await this.next.afterAllStep(test)
		test.reporter.testLifecycle(TestEvent.AfterAllStep, 'afterAll')
	}
	async beforeEachStep(test: Test): Promise<void> {
		await this.next.beforeEachStep(test)
		test.reporter.testLifecycle(TestEvent.BeforeEachStep, 'beforeEach')
	}
	async afterEachStep(test: Test): Promise<void> {
		await this.next.afterEachStep(test)
		test.reporter.testLifecycle(TestEvent.AfterEachStep, 'afterEach')
	}
	async onBeforeAllStepFinished(test: Test): Promise<void> {
		await this.next.onBeforeAllStepFinished(test)
		test.reporter.testLifecycle(TestEvent.BeforeAllStepFinished, 'beforeAll')
	}
	async onAfterAllStepFinished(test: Test): Promise<void> {
		await this.next.onAfterAllStepFinished(test)
		test.reporter.testLifecycle(TestEvent.AfterAllStepFinished, 'afterAll')
	}
	async onBeforeEachStepFinished(test: Test): Promise<void> {
		await this.next.onBeforeEachStepFinished(test)
		test.reporter.testLifecycle(TestEvent.BeforeEachStepFinished, 'beforeEach')
	}
	async onAfterEachStepFinished(test: Test): Promise<void> {
		await this.next.onAfterEachStepFinished(test)
		test.reporter.testLifecycle(TestEvent.AfterEachStepFinished, 'afterEach')
	}
	async beforeHookAction(test: Test, command: string): Promise<void> {
		await this.next.beforeHookAction(test, command)
		test.reporter.testLifecycle(TestEvent.BeforeHookAction, command)
	}
	async afterHookAction(test: Test, command: string): Promise<void> {
		await this.next.afterHookAction(test, command)
		test.reporter.testLifecycle(TestEvent.AfterHookAction, command)
	}
}
