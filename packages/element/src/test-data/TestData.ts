import { Feeder, FeedFilterFunction } from './Feeder'
import { Loader } from './Loader'

export class TestData<T> {
	public feeder: Feeder<T>
	public instanceID: string

	constructor(private loader: Loader<T>) {
		this.feeder = new Feeder<T>()
	}

	public setInstanceID(id: string) {
		this.feeder.instanceID = id
	}

	public async load() {
		await this.loader.load()
		this.feeder.append(this.loader.lines)
	}

	public circular(circular = true): TestData<T> {
		this.feeder.circular(circular)
		return this
	}

	public shuffle(shuffle = true): TestData<T> {
		this.feeder.shuffle(shuffle)
		return this
	}

	public filter(func: FeedFilterFunction<T>): TestData<T> {
		this.feeder.filter(func)
		return this
	}

	public feed(): T {
		if (!this.loader.isLoaded) throw new Error(`Test data has not been loaded yet!`)
		return this.feeder.feed()
	}

	public peek(): T {
		if (!this.loader.isLoaded) throw new Error(`Test data has not been loaded yet!`)
		return this.feeder.peek()
	}

	public get size(): number {
		return this.feeder.size
	}

	public get isComplete(): boolean {
		return this.feeder.isComplete
	}

	public get isEmpty(): boolean {
		return this.feeder.isEmpty
	}

	public get isStart(): boolean {
		return this.feeder.isStart
	}
}
