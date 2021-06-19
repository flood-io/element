import { NoOpTestObserver, TestObserver } from './TestObserver'
import { ITest } from './testTypes'
import { Step } from '../Step'
import { DEFAULT_ACTION_WAIT_MILLISECONDS } from '../Settings'

export default class InnerObserver extends NoOpTestObserver {
	constructor(next: TestObserver) {
		super(next)
	}

	async beforeStepAction(test: ITest, step: Step, command: string) {
		const actionDelay = test.settings.actionDelay ?? 0

		if (actionDelay > 0 && command !== 'wait') {
			await new Promise((resolve) => {
				setTimeout(resolve, Number(actionDelay) || DEFAULT_ACTION_WAIT_MILLISECONDS)
			})
		}

		return this.next.beforeStepAction(test, step, command)
	}
}
