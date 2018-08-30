import { NoOpTestObserver, TestObserver } from './Observer'
import Test from '../Test'
import { Step } from '../Step'
import { DEFAULT_ACTION_WAIT_SECONDS } from '../Settings'

export default class InnerObserver extends NoOpTestObserver {
	constructor(next: TestObserver) {
		super(next)
	}

	async beforeStepAction(test: Test, step: Step, command: string) {
		if (test.settings.actionDelay > 0 && command !== 'wait') {
			await new Promise(resolve => {
				// TODO fix default
				setTimeout(resolve, test.settings.actionDelay * 1e3 || DEFAULT_ACTION_WAIT_SECONDS * 1e3)
			})
		}

		return this.next.beforeStepAction(test, step, command)
	}
}
