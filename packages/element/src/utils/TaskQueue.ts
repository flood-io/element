export default class TaskQueue {
	public chain: Promise<any>

	constructor() {
		this.chain = Promise.resolve()
	}

	/**
	 * @param {function()} task
	 * @return {!Promise}
	 */
	postTask(task: PromiseLike<any>): Promise<any>
	postTask(task: (value) => any): Promise<any>
	postTask(task: any): Promise<any> {
		let result
		if (task.then && task.catch) {
			result = this.chain.then(() => task)
		} else {
			result = this.chain.then(task)
		}

		this.chain = result.catch(() => {})
		return result
	}
}
