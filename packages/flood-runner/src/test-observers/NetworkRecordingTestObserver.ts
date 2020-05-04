import { Context } from './Context'
import { Test, NoOpTestObserver, TestObserver } from '@flood/element-core'

export class NetworkRecordingTestObserver extends NoOpTestObserver {
	constructor(protected ctx: Context, protected next: TestObserver) {
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
