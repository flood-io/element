import { Option } from '../utils/Option'
import { Feeder, FeedFilterFunction } from './Feeder'
import { Loader } from './Loader'

/**
 * A `TestDataFactory` is available to be imported into your test script as `TestData`. Use this to load a <[TestDataSource]> which provides new test data to each iteration of your test.
 *
 * TODO
 * Files should be uploaded to ...
 */
export interface TestDataFactory {
	/**
	 * Loads a standard Javascript array of data objects
	 *
	 * @param objects an array of data objects
	 */
	fromData<TRow>(objects: TRow[]): TestDataSource<TRow>

	/**
	 * Loads test data from a CSV file, returning a `TestData` instance.
	 *
	 * @param filename the CSV to load
	 * @param separator (default: `,`) CSV separator to use
	 */
	fromCSV<TRow>(filename: string, separator: string): TestDataSource<TRow>

	/**
	 * Loads data from a JSON ffile
	 *
	 * @param filename the JSON to load.
	 */
	fromJSON<TRow>(filename: string): TestDataSource<TRow>
}

/**
 * TestDataSource is the instance returned by <[TestDataFactory]>'s methods.
 *
 * Call TestDataSource's methods to configure your data source:
 *
 * ```typescript
 * import { step, Browser, TestData, TestSettings } from '@flood/element'
 * export const settings: TestSettings = {
 *   loopCount: -1
 * }
 *
 * interface Row {
 *   username: string
 *   userID: number
 * }
 * TestData.fromCSV<Row>('users.csv')
 *   .circular(false) // Switch off circular data iteration.
 *                    // By default, when the end of the data is reached, it wraps to the beginning.
 *   .shuffle()       // Shuffle the data
 *
 * export default () => {
 *    step('Step 1', async (browser: Browser, row: Row) => {
 *      // for each loop, a different line from user.csv will be available as `row`
 *    })
 * }
 * ```
 */
export class TestDataSource<T> {
	/**
	 * @internal
	 */
	public feeder: Feeder<T>
	/**
	 * @internal
	 */
	public instanceID: string

	/**
	 * @internal
	 */
	private loader: Loader<T>

	constructor(loader: Loader<T>) {
		this.feeder = new Feeder<T>()
		this.loader = loader
	}

	/**
	 * @internal
	 */
	public setInstanceID(id: string) {
		this.feeder.instanceID = id
	}

	/**
	 * @internal
	 */
	public async load() {
		await this.loader.load()
		this.feeder.append(this.loader.lines)
	}

	/**
	 * Instructs the data feeder to repeat the data set when it reaches the end. TestData is circular by default; use this to turn circular data off.
	 *
	 * @param circular Default: true. Pass `false` to disable.
	 */
	public circular(circular = true): TestDataSource<T> {
		this.feeder.circular(circular)
		return this
	}

	/**
	 * Shuffles the data set using the Fisher-Yates method. Use this to randomise the order of your data. This will always be applied after filtering.
	 * @param shuffle Default: true. Pass `false` to disable.
	 */
	public shuffle(shuffle = true): TestDataSource<T> {
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
	public filter(func: FeedFilterFunction<T>): TestDataSource<T> {
		this.feeder.filter(func)
		return this
	}

	/**
	 * @internal
	 */
	public feed(): Option<T> {
		if (!this.loader.isLoaded) throw new Error(`Test data has not been loaded yet!`)
		return this.feeder.feed()
	}

	/**
	 * @internal
	 */
	public peek(): Option<T> {
		if (!this.loader.isLoaded) throw new Error(`Test data has not been loaded yet!`)
		return this.feeder.peek()
	}

	/**
	 * @internal
	 */
	public get size(): number {
		return this.feeder.size
	}

	/**
	 * @internal
	 */
	public get isComplete(): boolean {
		return this.feeder.isComplete
	}

	/**
	 * @internal
	 */
	public get isEmpty(): boolean {
		return this.feeder.isEmpty
	}

	/**
	 * @internal
	 */
	public get isStart(): boolean {
		return this.feeder.isStart
	}

	/**
	 * @internal
	 */
	public toString(): string {
		if (this.loader.isSet) {
			return [this.feeder.toString(), this.loader.toString()].filter(x => x.length).join(', ')
		} else {
			return 'no test data'
		}
	}
}
