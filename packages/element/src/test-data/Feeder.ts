import { Option } from '../utils/Option'
import { knuthShuffle } from 'knuth-shuffle'

export type FeedFilterFunction<Line> = (line: Line, index: number, instanceID: string) => boolean

export class Feeder<T> {
	private resetOnEnd: boolean = false
	private shuffleAfterLoad: boolean = false

	constructor(
		public instanceID: string = '',
		private lines: T[] = [],
		private pointer: number = -1,
		private filters: FeedFilterFunction<T>[] = [],
	) {
		this.resetOnEnd = true
		this.shuffleAfterLoad = false
		this.reset()
	}

	public append(lines: T[]): Feeder<T> {
		let { instanceID } = this

		if (!lines || lines.length === 0) return this

		let newLines = lines.filter((line, index) =>
			this.filters.every(func => func(line, index, instanceID)),
		)
		if (this.shuffleAfterLoad) {
			this.lines = knuthShuffle([...this.lines, ...newLines])
		} else {
			this.lines = [...this.lines, ...newLines]
		}

		return this
	}

	/**
	 * Configures the feeder to reset at the end, creating a repeating loop
	 */
	public circular(loop = true): Feeder<T> {
		this.resetOnEnd = loop
		return this
	}

	public shuffle(shuffle = true): Feeder<T> {
		this.shuffleAfterLoad = shuffle
		return this
	}

	public filter(func: FeedFilterFunction<T>): Feeder<T> {
		this.filters.push(func)
		return this
	}

	/**
	 * Advances the feed by one iteration
	 */
	public feed(): Option<T> {
		if (this.isComplete && this.resetOnEnd) {
			this.reset()
		}

		this.pointer++
		return this.peek()
	}

	/**
	 * Reads the data at the current cursor without advancing
	 */
	public peek(): Option<T> {
		return this.lines[this.pointer] || null
	}

	public reset(): void {
		this.pointer = -1
	}

	public get size(): number {
		return this.lines.length
	}

	public get isComplete(): boolean {
		return this.pointer >= this.lines.length - 1
	}

	public get isStart(): boolean {
		return this.pointer === -1
	}

	public get isEmpty(): boolean {
		return this.lines.length === 0
	}
}
