import { ITest } from './testTypes'
import { Step } from '../Step'
import { StructuredError } from '../../utils/StructuredError'
export type NextFunction = () => Promise<void>

export interface TestObserver {
	before(test: ITest): Promise<void>
	after(test: ITest): Promise<void>

	beforeStep(test: ITest, step: Step): Promise<void>
	onStepPassed(test: ITest, step: Step): Promise<void>
	onStepError(test: ITest, step: Step, error: StructuredError<any>): Promise<void>
	onStepSkipped(test: ITest, step: Step): Promise<void>
	afterStep(test: ITest, step: Step): Promise<void>

	beforeStepAction(test: ITest, step: Step, command: string): Promise<void>
	afterStepAction(test: ITest, step: Step, command: string): Promise<void>
}

export class NoOpTestObserver implements TestObserver {
	constructor(public next: TestObserver) {}

	async before(test: ITest): Promise<void> {
		return this.next.before(test)
	}
	async after(test: ITest): Promise<void> {
		return this.next.after(test)
	}

	async beforeStep(test: ITest, step: Step): Promise<void> {
		return this.next.beforeStep(test, step)
	}
	async onStepPassed(test: ITest, step: Step): Promise<void> {
		return this.next.onStepPassed(test, step)
	}
	async onStepError(test: ITest, step: Step, error: StructuredError<any>): Promise<void> {
		return this.next.onStepError(test, step, error)
	}
	async onStepSkipped(test: ITest, step: Step): Promise<void> {
		return this.next.onStepSkipped(test, step)
	}
	async afterStep(test: ITest, step: Step): Promise<void> {
		return this.next.afterStep(test, step)
	}

	async beforeStepAction(test: ITest, step: Step, command: string): Promise<void> {
		return this.next.beforeStepAction(test, step, command)
	}
	async afterStepAction(test: ITest, step: Step, command: string): Promise<void> {
		return this.next.afterStepAction(test, step, command)
	}
}

export class NullTestObserver implements TestObserver {
	async before(test: ITest): Promise<void> {
		return
	}
	async after(test: ITest): Promise<void> {
		return
	}

	async beforeStep(test: ITest, step: Step): Promise<void> {
		return
	}
	async onStepPassed(test: ITest, step: Step): Promise<void> {
		return
	}
	async onStepError(test: ITest, step: Step, error: StructuredError<any>): Promise<void> {
		return
	}
	async onStepSkipped(test: ITest, step: Step): Promise<void> {
		return
	}
	async afterStep(test: ITest, step: Step): Promise<void> {
		return
	}

	async beforeStepAction(test: ITest, step: Step, command: string): Promise<void> {
		return
	}
	async afterStepAction(test: ITest, step: Step, command: string): Promise<void> {
		return
	}
}
