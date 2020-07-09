import { NoOpTestObserver, TestObserver } from './Observer'
import { ITest } from '../ITest'
import { Step } from '../Step'
import { DEFAULT_ACTION_WAIT_SECONDS } from '../Settings'
import ms from 'ms'

export default class InnerObserver extends NoOpTestObserver {
	constructor(next: TestObserver) {
		super(next)
	}

	async beforeStepAction(test: ITest, step: Step, command: string) {
		const actionDelay = test.settings.actionDelay ?? 0

		if (actionDelay > 0 && command !== 'wait') {
			await new Promise(resolve => {
				// TODO: fix default
				setTimeout(resolve, actionDelay || ms(DEFAULT_ACTION_WAIT_SECONDS))
			})
		}

		return this.next.beforeStepAction(test, step, command)
	}
}
