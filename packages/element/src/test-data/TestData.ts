import { Option } from '../utils/Option'
import { Feeder, FeedFilterFunction } from './Feeder'
import { Loader } from './Loader'

/**
 * Use this to load test data which will be iterated over with each iteration of your test.
 */
export interface TestData {
	/**
	 * Loads a standard Javascript array of data objects
	 */
	fromData<TRow>(lines: TRow[]): TestDataImpl<TRow>

	/**
	 * Loads test data from a CSV file, returning a `TestData` instance.
	 */
	fromCSV<TRow>(filename: string, seperator: string): TestDataImpl<TRow>

	/**
	 * Loads data from a JSON ffile
	 */
	fromJSON<TRow>(filename: string): TestDataImpl<TRow>
}

export class TestDataImpl<T> {
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

	/**
	 * Instructs the data feeder to repeat the data set when it reaches the end.
	 * @param circular optional, pass `false` to disable
	 */
	public circular(circular = true): TestDataImpl<T> {
		this.feeder.circular(circular)
		return this
	}

	/**
	 * Shuffles the data set using the Fisher-Yates method. Use this to randomise the order of your data. This will always be applied after filtering.
	 * @param shuffle optional, pass `false` to disable
	 */
	public shuffle(shuffle = true): TestDataImpl<T> {
		this.feeder.shuffle(shuffle)
		return this
	}

	/**
	 * Adds a filter to apply against each line in the data set.
	 *
	 * Filters can be chained, and will be run in order only if the previous ffilter passed.
	 *
	 * Example:
	 * ```typescript
	 * type Row = { browser: string, email: string }
	 * TestData.fromCSV("users.csv").filter((line, index, browserID) => line.browser === browserID)
	 * ```
	 *
	 * @param func filter function to compare each line
	 */
	public filter(func: FeedFilterFunction<T>): TestDataImpl<T> {
		this.feeder.filter(func)
		return this
	}

	public feed(): Option<T> {
		if (!this.loader.isLoaded) throw new Error(`Test data has not been loaded yet!`)
		return this.feeder.feed()
	}

	public peek(): Option<T> {
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
