import { Test } from './testTypes'
import { TestObserver } from './TestObserver'
import { Step } from '../Step'
import { TestEvent } from '@flood/element-report'
import { StructuredError } from '../../utils/StructuredError'
import { TimingObserver } from './TimingObserver'

export default class LifecycleObserver implements TestObserver {
	constructor(public next: TestObserver) {}
	async before(test: Test): Promise<void> {
		test.reporter.testLifecycle(TestEvent.BeforeTest, 'test')
		return this.next.before(test)
	}

	async after(test: Test): Promise<void> {
		await this.next.after(test)

		if (test.failed) {
			test.reporter.testLifecycle(TestEvent.TestFailed, 'test')
		} else {
			test.reporter.testLifecycle(TestEvent.TestSucceeded, 'test')
		}

		test.reporter.testLifecycle(TestEvent.AfterTest, 'test')
	}

	async beforeStep(test: Test, step: Step): Promise<void> {
		test.reporter.testLifecycle(TestEvent.BeforeStep, step.name, step.subTitle)
		return this.next.beforeStep(test, step)
	}

	async onStepPassed(test: Test, step: Step): Promise<void> {
		const testObserver: TestObserver = this.next
		const timing = await (testObserver as TimingObserver).getMeasurementTime(
			test.settings.responseTimeMeasurement,
			true,
		)
		step.duration = timing
		await testObserver.onStepPassed(test, step)
		test.reporter.testLifecycle(TestEvent.StepSucceeded, step.name, step.subTitle, timing)
	}

	async onStepError(test: Test, step: Step, error: StructuredError<any>): Promise<void> {
		const testObserver: TestObserver = this.next
		const timing = await (testObserver as TimingObserver).getMeasurementTime(
			test.settings.responseTimeMeasurement,
			true,
		)
		step.duration = timing
		await testObserver.onStepError(test, step, error)
		test.reporter.testLifecycle(
			TestEvent.StepFailed,
			step.name,
			step.subTitle,
			timing,
			error?.message,
		)
	}

	async onStepSkipped(test: Test, step: Step): Promise<void> {
		await this.next.onStepSkipped(test, step)
		test.reporter.testLifecycle(TestEvent.StepSkipped, step.name)
	}

	async onStepUnexecuted(test: Test, step: Step): Promise<void> {
		await this.next.onStepUnexecuted(test, step)
		test.reporter.testLifecycle(TestEvent.StepUnexecuted, step.name)
	}

	async afterStep(test: Test, step: Step): Promise<void> {
		const testObserver: TestObserver = this.next
		await testObserver.afterStep(test, step)
		const timing = await (testObserver as TimingObserver).getMeasurementTime(
			test.settings.responseTimeMeasurement,
		)
		test.reporter.testLifecycle(TestEvent.AfterStep, step.name, step.subTitle, timing)
	}

	async beforeStepAction(test: Test, step: Step, command: string, args?: string): Promise<void> {
		await this.next.beforeStepAction(test, step, command)
		test.reporter.testLifecycle(TestEvent.BeforeStepAction, command, '', 0, '', args)
	}
	async afterStepAction(test: Test, step: Step, command: string, args?: string): Promise<void> {
		await this.next.afterStepAction(test, step, command, args)
		test.reporter.testLifecycle(TestEvent.AfterStepAction, command, '', 0, '', args)
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
	async beforeHookAction(test: Test, command: string, args?: string): Promise<void> {
		await this.next.beforeHookAction(test, command, args)
		test.reporter.testLifecycle(TestEvent.BeforeHookAction, command, '', 0, '', args)
	}
	async afterHookAction(test: Test, command: string, args?: string): Promise<void> {
		await this.next.afterHookAction(test, command, args)
		test.reporter.testLifecycle(TestEvent.AfterHookAction, command, '', 0, '', args)
	}
}
