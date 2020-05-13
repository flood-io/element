import { Context } from './Context'
import { NoOpTestObserver, TestObserver } from './Observer'
import Test from '../Test'

export class NetworkRecordingTestObserver extends NoOpTestObserver {
	constructor(protected ctx: Context, public next: TestObserver) {
		super(next)
	}

	async syncNetworkRecorder() {
		await this.ctx.networkRecorder.sync()
	}

	async before(test: Test): Promise<void> {
		this.ctx.attachTest(test)
		return this.next.before(test)
	}
}
