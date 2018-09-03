import { CSVLoader, JSONLoader, DataLoader, NullLoader } from './Loader'
import { TestDataFactory, TestDataSource } from './TestData'
import { WorkRoot } from '../runtime-environment/types'

export class TestDataLoaders implements TestDataFactory {
	constructor(private workRoot: WorkRoot) {}

	/**
	 * Loads a standard Javascript array of data objects
	 */
	public fromData<TRow>(lines: TRow[]): TestDataSource<TRow> {
		let loader = new DataLoader<TRow>(lines)
		return new TestDataSource<TRow>(loader)
	}

	/**
	 * Loads test data from a CSV file, returning a `<[TestDataSource]>` instance.
	 */
	public fromCSV<TRow>(filename: string, seperator: string = ','): TestDataSource<TRow> {
		let loader = new CSVLoader<TRow>(this.workRoot.join('test-data', 'files', filename), seperator)
		return new TestDataSource<TRow>(loader)
	}

	/**
	 * Loads data from a JSON ffile
	 */
	public fromJSON<TRow>(filename: string): TestDataSource<TRow> {
		let loader = new JSONLoader<TRow>(this.workRoot.join('test-data', 'files', filename))
		return new TestDataSource<TRow>(loader)
	}
}

export class NullTestDataLoaders implements TestDataFactory {
	public fromData<TRow>(lines: TRow[]): TestDataSource<TRow> {
		return new TestDataSource<TRow>(new NullLoader())
	}
	public fromCSV<TRow>(filename: string, seperator: string = ','): TestDataSource<TRow> {
		return new TestDataSource<TRow>(new NullLoader())
	}
	public fromJSON<TRow>(filename: string): TestDataSource<TRow> {
		return new TestDataSource<TRow>(new NullLoader())
	}
}
