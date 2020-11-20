import { ITest } from './testTypes'
import { Step } from '../Step'
import { StructuredError } from '../../utils/StructuredError'
export type NextFunction = () => Promise<void>

export interface HookObserver {
	beforeAllStep(test: ITest): Promise<void>
	afterAllStep(test: ITest): Promise<void>
	beforeEachStep(test: ITest): Promise<void>
	afterEachStep(test: ITest): Promise<void>
	onBeforeAllStepFinished(test: ITest): Promise<void>
	onAfterAllStepFinished(test: ITest): Promise<void>
	onBeforeEachStepFinished(test: ITest): Promise<void>
	onAfterEachStepFinished(test: ITest): Promise<void>
	beforeHookAction(test: ITest, command: string): Promise<void>
	afterHookAction(test: ITest, command: string, arg?: string): Promise<void>
}
export interface TestObserver extends HookObserver {
	before(test: ITest): Promise<void>
	after(test: ITest): Promise<void>

	beforeStep(test: ITest, step: Step): Promise<void>
	onStepPassed(test: ITest, step: Step): Promise<void>
	onStepError(test: ITest, step: Step, error: StructuredError<any>): Promise<void>
	onStepSkipped(test: ITest, step: Step): Promise<void>
	onStepUnexecuted(test: ITest, step: Step): Promise<void>
	afterStep(test: ITest, step: Step): Promise<void>

	beforeStepAction(test: ITest, step: Step, command: string): Promise<void>
	afterStepAction(test: ITest, step: Step, command: string, args?: string): Promise<void>
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

	async onStepUnexecuted(test: ITest, step: Step): Promise<void> {
		return this.next.onStepUnexecuted(test, step)
	}
	async afterStep(test: ITest, step: Step): Promise<void> {
		return this.next.afterStep(test, step)
	}

	async beforeStepAction(test: ITest, step: Step, command: string): Promise<void> {
		return this.next.beforeStepAction(test, step, command)
	}
	async afterStepAction(test: ITest, step: Step, command: string, args?: string): Promise<void> {
		return this.next.afterStepAction(test, step, command, args)
	}

	async beforeAllStep(test: ITest): Promise<void> {
		return this.next.beforeAllStep(test)
	}
	async afterAllStep(test: ITest): Promise<void> {
		return this.next.afterAllStep(test)
	}
	async beforeEachStep(test: ITest): Promise<void> {
		return this.next.beforeEachStep(test)
	}
	async afterEachStep(test: ITest): Promise<void> {
		return this.next.afterEachStep(test)
	}
	async onBeforeAllStepFinished(test: ITest): Promise<void> {
		return this.next.onBeforeAllStepFinished(test)
	}
	async onAfterAllStepFinished(test: ITest): Promise<void> {
		return this.next.onAfterAllStepFinished(test)
	}
	async onBeforeEachStepFinished(test: ITest): Promise<void> {
		return this.next.onBeforeEachStepFinished(test)
	}
	async onAfterEachStepFinished(test: ITest): Promise<void> {
		return this.next.onAfterEachStepFinished(test)
	}

	async beforeHookAction(test: ITest, command: string): Promise<void> {
		return this.next.beforeHookAction(test, command)
	}
	async afterHookAction(test: ITest, command: string, args: string): Promise<void> {
		return this.next.afterHookAction(test, command, args)
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
	async onStepUnexecuted(test: ITest, step: Step): Promise<void> {
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

	async beforeAllStep(test: ITest): Promise<void> {
		return
	}
	async afterAllStep(test: ITest): Promise<void> {
		return
	}
	async beforeEachStep(test: ITest): Promise<void> {
		return
	}
	async afterEachStep(test: ITest): Promise<void> {
		return
	}
	async onBeforeAllStepFinished(test: ITest): Promise<void> {
		return
	}
	async onAfterAllStepFinished(test: ITest): Promise<void> {
		return
	}
	async onBeforeEachStepFinished(test: ITest): Promise<void> {
		return
	}
	async onAfterEachStepFinished(test: ITest): Promise<void> {
		return
	}
	async beforeHookAction(test: ITest, command: string): Promise<void> {
		return
	}
	async afterHookAction(test: ITest, command: string): Promise<void> {
		return
	}
}
