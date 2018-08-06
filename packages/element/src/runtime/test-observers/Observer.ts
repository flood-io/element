import Test from '../Test'
import { Step } from '../Step'
import { StructuredError } from '../../utils/StructuredError'

// import * as debugFactory from 'debug'
// const debug = debugFactory('element:test:observer')

export type NextFunction = () => Promise<void>

export interface TestObserver {
	before(test: Test): Promise<void>
	after(test: Test): Promise<void>

	beforeStep(test: Test, step: Step): Promise<void>
	onStepPassed(test: Test, step: Step): Promise<void>
	onStepError<T>(test: Test, step: Step, error: StructuredError<T>): Promise<void>
	onStepSkipped(test: Test, step: Step): Promise<void>
	afterStep(test: Test, step: Step): Promise<void>

	beforeStepAction(test: Test, step: Step, command: string): Promise<void>
	afterStepAction(test: Test, step: Step, command: string): Promise<void>
}

export class NoOpTestObserver implements TestObserver {
	constructor(protected next: TestObserver) {}

	async before(test: Test): Promise<void> {
		return this.next.before(test)
	}
	async after(test: Test): Promise<void> {
		return this.next.after(test)
	}

	async beforeStep(test: Test, step: Step): Promise<void> {
		return this.next.beforeStep(test, step)
	}
	async onStepPassed(test: Test, step: Step): Promise<void> {
		return this.next.onStepPassed(test, step)
	}
	async onStepError<T>(test: Test, step: Step, error: StructuredError<T>): Promise<void> {
		return this.next.onStepError(test, step, error)
	}
	async onStepSkipped(test: Test, step: Step): Promise<void> {
		return this.next.onStepSkipped(test, step)
	}
	async afterStep(test: Test, step: Step): Promise<void> {
		return this.next.afterStep(test, step)
	}

	async beforeStepAction(test: Test, step: Step, command: string): Promise<void> {
		return this.next.beforeStepAction(test, step, command)
	}
	async afterStepAction(test: Test, step: Step, command: string): Promise<void> {
		return this.next.afterStepAction(test, step, command)
	}
}

export class NullTestObserver implements TestObserver {
	async before(test: Test): Promise<void> {
		return
	}
	async after(test: Test): Promise<void> {
		return
	}

	async beforeStep(test: Test, step: Step): Promise<void> {
		return
	}
	async onStepPassed(test: Test, step: Step): Promise<void> {
		return
	}
	async onStepError<T>(test: Test, step: Step, error: StructuredError<T>): Promise<void> {
		return
	}
	async onStepSkipped(test: Test, step: Step): Promise<void> {
		return
	}
	async afterStep(test: Test, step: Step): Promise<void> {
		return
	}

	async beforeStepAction(test: Test, step: Step, command: string): Promise<void> {
		return
	}
	async afterStepAction(test: Test, step: Step, command: string): Promise<void> {
		return
	}
}
