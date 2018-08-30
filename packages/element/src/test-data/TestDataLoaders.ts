import { CSVLoader, JSONLoader, DataLoader, NullLoader } from './Loader'
import { TestData as TestDataFactory, TestDataImpl as TestData } from './TestData'
import { WorkRoot } from '../runtime-environment/types'

/**
 * Use this to load test data which will be iterated over with each iteration of your test.
 */
export class TestDataLoaders implements TestDataFactory {
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

export class NullTestDataLoaders implements TestDataFactory {
	public fromData<TRow>(lines: TRow[]): TestData<TRow> {
		return new TestData<TRow>(new NullLoader())
	}
	public fromCSV<TRow>(filename: string, seperator: string = ','): TestData<TRow> {
		return new TestData<TRow>(new NullLoader())
	}
	public fromJSON<TRow>(filename: string): TestData<TRow> {
		return new TestData<TRow>(new NullLoader())
	}
}
