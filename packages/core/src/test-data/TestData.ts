import { Option } from '../utils/Option'
import { Feeder, FeedFilterFunction } from './Feeder'
import { FileType, Loader, NullLoader } from './Loader'

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
	public instanceID: string

	/**
	 * @internal
	 */
	private loaders: Loader<T>[]

	constructor(loader: Loader<T>) {
		this.loaders = [loader]
	}

	private static _instance: TestDataSource<any>
	public static getInstance() {
		return this._instance || (this._instance = new TestDataSource<any>(new NullLoader()))
	}

	public addLoader(loader: Loader<T>): TestDataSource<T> {
		this.loaders.push(loader)
		return this
	}

	/**
	 * @internal
	 */
	public setInstanceID(id: string) {
		Feeder.getInstance().instanceID = id
	}

	/**
	 * set loader alias
	 * @param name: name of the loader
	 */
	public as(name: string): TestDataSource<T> {
		const loader = this.loaders[this.loaders.length - 1]
		Feeder.getInstance().configLoaderName(name, loader.loaderName)
		loader.asName(name)
		return this
	}

	/**
	 * @internal
	 */
	public async load() {
		const loaderCheck: { type: FileType; alias: string }[] = []
		await Promise.all(
			this.loaders.map(loader => {
				loaderCheck.push({ type: loader.type(), alias: loader.loaderName })
				const invalidLoader = loaderCheck.reduce((invalidMsg, lc) => {
					if (lc.type !== loader.type() && lc.alias === loader.loaderName) {
						invalidMsg = 'Data files imported using different methods cannot have the same alias'
					}
					if (
						loader.type() === FileType.DATA &&
						lc.type !== FileType.DATA &&
						loader.loaderName === ''
					) {
						invalidMsg =
							'Alias name of the data imported using fromData() must be specified by using as()'
					}
					return invalidMsg
				}, '')
				if (invalidLoader) {
					throw Error(invalidLoader)
				}
				return loader.load()
			}),
		)
		const feeder = Feeder.getInstance()
		this.loaders.map(loader => {
			feeder.append(loader.lines, loader.loaderName, loader.type())
		})
	}

	/**
	 * clear all loader data
	 */
	public clear(): void {
		this.loaders = []
		Feeder.getInstance().clear()
	}

	/**
	 * Instructs the data feeder to repeat the data set when it reaches the end. TestData is circular by default; use this to turn circular data off.
	 *
	 * @param circular Default: true. Pass `false` to disable.
	 */
	public circular(circular = true): TestDataSource<T> {
		Feeder.getInstance().circular(circular, this.loaders[this.loaders.length - 1].loaderName)
		return this
	}

	/**
	 * Shuffles the data set using the Fisher-Yates method. Use this to randomise the order of your data. This will always be applied after filtering.
	 * @param shuffle Default: true. Pass `false` to disable.
	 */
	public shuffle(shuffle = true): TestDataSource<T> {
		Feeder.getInstance().shuffle(shuffle, this.loaders[this.loaders.length - 1].loaderName)
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
		Feeder.getInstance().filter(func, this.loaders[this.loaders.length - 1].loaderName)
		return this
	}

	public isLoaded(): boolean {
		return this.loaders.every(loader => loader.isLoaded)
	}

	public isSet(): boolean {
		return this.loaders.every(loader => loader.isSet)
	}

	public get multiple(): boolean {
		return this.loaders.length > 0
	}

	/**
	 * @internal
	 */
	public feed(): Option<T> {
		if (!this.isLoaded) throw new Error(`Test data has not been loaded yet!`)
		return Feeder.getInstance().feed()
	}

	/**
	 * @internal
	 */
	public peek(): Option<T> {
		if (!this.isLoaded) throw new Error(`Test data has not been loaded yet!`)
		return Feeder.getInstance().peek()
	}

	/**
	 * @internal
	 */
	public get size(): number {
		return Feeder.getInstance().size
	}

	/**
	 * @internal
	 */
	public get isComplete(): boolean {
		return Feeder.getInstance().isComplete
	}

	/**
	 * @internal
	 */
	public get isEmpty(): boolean {
		return Feeder.getInstance().isEmpty
	}

	/**
	 * @internal
	 */
	public get isStart(): boolean {
		return Feeder.getInstance().isStart
	}

	/**
	 * @internal
	 */
	public toString(): string {
		if (this.isSet()) {
			return [Feeder.getInstance().toString(), this.loaders.map(loader => loader.toString())]
				.filter(x => x.length)
				.join(', ')
		} else {
			return 'no test data'
		}
	}
}
