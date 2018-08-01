import Test from '../Test'
import { Step } from '../Step'

export type NextFunction = () => Promise<void>

export interface TestObserver {
	before(test: Test): Promise<void>
	after(test: Test): Promise<void>

	beforeStep(test: Test, step: Step): Promise<void>
	onStepPassed(test: Test, step: Step): Promise<void>
	onStepError(test: Test, step: Step, error: Error): Promise<void>
	onStepSkipped(test: Test, step: Step): Promise<void>
	afterStep(test: Test, step: Step): Promise<void>

	beforeStepAction(test: Test, step: Step, command: string): Promise<void>
	afterStepAction(test: Test, step: Step, command: string): Promise<void>
}

export interface ComposableTestObserver {
	before(test: Test, next: NextFunction): Promise<void>
	after(test: Test, next: NextFunction): Promise<void>

	beforeStep(test: Test, step: Step, next: NextFunction): Promise<void>
	onStepPassed(test: Test, step: Step, next: NextFunction): Promise<void>
	onStepError(test: Test, step: Step, error: Error, next: NextFunction): Promise<void>
	onStepSkipped(test: Test, step: Step, next: NextFunction): Promise<void>
	afterStep(test: Test, step: Step, next: NextFunction): Promise<void>

	beforeStepAction(test: Test, step: Step, command: string, next: NextFunction): Promise<void>
	afterStepAction(test: Test, step: Step, command: string, next: NextFunction): Promise<void>
}

export class NoOpTestObserver implements ComposableTestObserver {
	async before(test: Test, next: NextFunction): Promise<void> {
		return next()
	}
	async after(test: Test, next: NextFunction): Promise<void> {
		return next()
	}

	async beforeStep(test: Test, step: Step, next: NextFunction): Promise<void> {
		return next()
	}
	async onStepPassed(test: Test, step: Step, next: NextFunction): Promise<void> {
		return next()
	}
	async onStepError(test: Test, step: Step, error: Error, next: NextFunction): Promise<void> {
		return next()
	}
	async onStepSkipped(test: Test, step: Step, next: NextFunction): Promise<void> {
		return next()
	}
	async afterStep(test: Test, step: Step, next: NextFunction): Promise<void> {
		return next()
	}

	async beforeStepAction(
		test: Test,
		step: Step,
		command: string,
		next: NextFunction,
	): Promise<void> {
		return next()
	}
	async afterStepAction(
		test: Test,
		step: Step,
		command: string,
		next: NextFunction,
	): Promise<void> {
		return next()
	}
}

export class ComposedTestObserver implements TestObserver {
	observers: ComposableTestObserver[]
	constructor(...observers: ComposableTestObserver[]) {
		this.observers = observers
	}

	async callComposed(method: string, ...args: any[]): Promise<void> {
		const fn: NextFunction = this.observers.reduce(
			(next: NextFunction, observer: ComposableTestObserver) => {
				const currentFn = observer[method]
				const theseArgs = [...args, next]
				return async () => {
					await currentFn.call(observer, theseArgs)
				}
			},
			async () => {},
		)

		return fn()
	}

	async before(test: Test): Promise<void> {
		return this.callComposed('before', test)
	}
	async after(test: Test): Promise<void> {
		return this.callComposed('after', test)
	}

	async beforeStep(test: Test, step: Step): Promise<void> {
		return this.callComposed('beforeStep', test, step)
	}
	async onStepPassed(test: Test, step: Step): Promise<void> {
		return this.callComposed('onStepPassed', test, step)
	}
	async onStepError(test: Test, step: Step, error: Error): Promise<void> {
		return this.callComposed('onStepError', test, step, error)
	}
	async onStepSkipped(test: Test, step: Step): Promise<void> {
		return this.callComposed('onStepSkipped', test, step)
	}
	async afterStep(test: Test, step: Step): Promise<void> {
		return this.callComposed('afterStep', test, step)
	}

	async beforeStepAction(test: Test, step: Step, command: string): Promise<void> {
		return this.callComposed('beforeStepAction', test, step, command)
	}
	async afterStepAction(test: Test, step: Step, command: string): Promise<void> {
		return this.callComposed('afterStepAction', test, step, command)
	}
}
