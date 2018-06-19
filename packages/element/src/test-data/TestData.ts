import { Feeder, FeedFilterFunction } from './Feeder'
import { CSVLoader, Loader, JSONLoader, DataLoader } from './Loader'
import { join } from 'path'
import { testDataDirectory } from '../runtime/Sandbox'

export class TestData<T> {
	public feeder: Feeder<T>
	public instanceID: string

	private constructor(private loader: Loader<T>) {
		this.feeder = new Feeder<T>()
	}

	public setInstanceID(id: string) {
		this.feeder.instanceID = id
	}

	public static fromData<TRow>(lines: TRow[]): TestData<TRow> {
		let loader = new DataLoader<TRow>(lines)
		return new TestData<TRow>(loader)
	}

	public static fromCSV<TRow>(filename: string, seperator: string = ','): TestData<TRow> {
		let loader = new CSVLoader<TRow>(join(testDataDirectory, 'files', filename), seperator)
		return new TestData<TRow>(loader)
	}

	public static fromJSON<TRow>(filename: string): TestData<TRow> {
		let loader = new JSONLoader<TRow>(join(testDataDirectory, 'files', filename))
		return new TestData<TRow>(loader)
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
