export default class Queue<Specifier> {
	constructor(private queue: Specifier[] = [], private pointer: number = 0) {}

	public push(item: Specifier) {
		this.queue.push(item)
	}

	public pop() {
		let p = this.pointer++
		if (p >= this.queue.length) return null
		return this.queue[p]
	}

	public peek(): Specifier {
		let p = this.pointer
		if (p >= this.queue.length) return null
		return this.queue[p]
	}

	public flush() {
		this.queue.length = 0
		this.pointer = 0
	}
}
