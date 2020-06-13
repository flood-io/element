import { NoOpTestObserver, TestObserver } from './TestObserver'
import { ITest } from '../../interface/ITest'
import { Step } from '../Step'
import { DEFAULT_ACTION_WAIT_SECONDS } from '../Settings'

export default class InnerObserver extends NoOpTestObserver {
	constructor(next: TestObserver) {
		super(next)
	}

	async beforeStepAction(test: ITest, step: Step, command: string) {
		const actionDelay = test.settings.actionDelay ?? 0

		if (actionDelay > 0 && command !== 'wait') {
			await new Promise(resolve => {
				// TODO: fix default
				setTimeout(resolve, actionDelay * 1e3 || DEFAULT_ACTION_WAIT_SECONDS * 1e3)
			})
		}

		return this.next.beforeStepAction(test, step, command)
	}
}
