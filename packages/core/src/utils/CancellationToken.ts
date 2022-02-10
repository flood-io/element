type K = () => void
type KK = (f: K) => void
const kk = (f: KK) => {}

/**
 * Adapted from https://stackoverflow.com/a/37642079
 *
 * @hidden
 */
export class CancellationToken {
	static neverCancelToken(): CancellationToken {
		return new CancellationToken()
	}

	isCancellationRequested = false

	// actions to execute when cancelled
	onCancelled: K[] = []

	promise: Promise<void>

	constructor(defineUserCancels = kk) {
		this.onCancelled.push(() => (this.isCancellationRequested = true))

		// expose a promise to the outside
		this.promise = new Promise((resolve) => this.onCancelled.push(resolve))

		// let the user add handlers
		defineUserCancels((f: K) => {
			this.onCancelled.push(f)
			return
		})
	}
	cancel() {
		this.onCancelled.forEach((x) => x())
	}
}
