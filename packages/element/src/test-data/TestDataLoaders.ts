import { CSVLoader, JSONLoader, DataLoader } from './Loader'
import { TestData, TestDataFactory } from './TestData'
import { WorkRoot } from '../runtime-environment/types'

/**
 * Use this to load test data which will be iterated over with each iteration of your test.
 *
 * @export
 * @class TestData
 * @template T
 */
export class TestDataLoaders<TRow> implements TestDataFactory<TRow> {
	constructor(private workRoot: WorkRoot) {}

	/**
	 * Loads a standard Javascript array of data objects
	 */
	public fromData<TRow>(lines: TRow[]): TestData<TRow> {
		let loader = new DataLoader<TRow>(lines)
		return new TestData<TRow>(loader)
	}

	/**
	 * Loads test data from a CSV file, returning a `TestData` instance.
	 */
	public fromCSV<TRow>(filename: string, seperator: string = ','): TestData<TRow> {
		let loader = new CSVLoader<TRow>(this.workRoot.join('test-data', 'files', filename), seperator)
		return new TestData<TRow>(loader)
	}

	/**
	 * Loads data from a JSON ffile
	 */
	public fromJSON<TRow>(filename: string): TestData<TRow> {
		let loader = new JSONLoader<TRow>(this.workRoot.join('test-data', 'files', filename))
		return new TestData<TRow>(loader)
	}
}
