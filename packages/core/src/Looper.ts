import { ConcreteTestSettings } from './runtime/Settings'

export class Looper {
	public iterations = 0
	private timeout: any
	private cancelled = false
	private loopCount: number
	private iterationState: { isNew: boolean; changeAt: number } = { isNew: true, changeAt: 0 }

	public done: Promise<void>
	private doneResolve: () => void

	constructor(settings: ConcreteTestSettings, running = true) {
		if (settings.duration > 0) {
			this.timeout = setTimeout(() => {
				this.cancelled = true
			}, Number(settings.duration))
		}

		this.loopCount = settings.loopCount
		this.cancelled = !running
		this.done = new Promise(resolve => (this.doneResolve = resolve))
	}

	stop() {
		this.cancelled = true
	}

	async kill(): Promise<void> {
		if (this._killer !== undefined) {
			this._killer()
		}
		this.cancelled = true

		await this.done
	}

	_killer: () => void
	set killer(killCb: () => void) {
		this._killer = killCb
	}

	finish() {
		clearTimeout(this.timeout)
	}

	get continueLoop(): boolean {
		const hasInfiniteLoops = this.loopCount <= 0
		const hasLoopsLeft = this.iterations < this.loopCount

		return !this.cancelled && (hasLoopsLeft || hasInfiniteLoops)
	}

	restartLoop(): void {
		this.iterationState.isNew = false
		this.iterationState.changeAt = this.iterations
		this.iterations -= 1
	}

	isNewIteration(): boolean {
		return this.iterationState.isNew
	}

	async run(iterator: (iteration: number) => Promise<void>): Promise<number> {
		try {
			while (this.continueLoop) {
				this.iterations += 1
				await iterator(this.iterations)
				if (this.iterations === this.iterationState.changeAt) {
					this.iterationState.isNew = true
					this.iterationState.changeAt = 0
				}
			}
			this.finish()
		} finally {
			this.doneResolve()
		}

		return this.iterations
	}
}
