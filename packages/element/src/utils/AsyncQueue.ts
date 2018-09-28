export class AsyncQueue<Specifier> {
	constructor(public chain: Promise<Specifier | null> = Promise.resolve(null)) {}

	add(task: PromiseLike<Specifier>): Promise<Specifier>
	add(task: (value: any) => Specifier): Promise<Specifier>
	add(task: any): Promise<Specifier> {
		let result
		if (task.then && task.catch) {
			result = this.chain.then(() => task)
		} else {
			result = this.chain.then(task)
		}

		this.chain = result.catch((err: Error) => {
			console.error(`[AsyncQueue] Callback chain error: ${err.message}`, err.stack)
		})
		return result
	}
}
