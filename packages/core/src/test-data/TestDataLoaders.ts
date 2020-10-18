import { CSVLoader, JSONLoader, DataLoader, NullLoader } from './Loader'
import { TestDataFactory, TestDataSource } from './TestData'
import { WorkRoot } from '../runtime-environment/types'

export class TestDataLoaders implements TestDataFactory {
	constructor(private workRoot: WorkRoot) {}

	/**
	 * Loads a standard Javascript array of data objects
	 */
	public fromData<TRow>(lines: TRow[]): TestDataSource<TRow> {
		const loader = new DataLoader<TRow>(lines)
		const testDataSource = TestDataSource.getInstance()
		testDataSource.addLoader(loader)
		return testDataSource
	}

	/**
	 * Loads test data from a CSV file, returning a `<[TestDataSource]>` instance.
	 */
	public fromCSV<TRow>(filename: string, separator = ','): TestDataSource<TRow> {
		const loader = new CSVLoader<TRow>(this.workRoot.testData(filename), separator)
		return TestDataSource.getInstance().addLoader(loader)
	}

	/**
	 * Loads data from a JSON file
	 */
	public fromJSON<TRow>(filename: string): TestDataSource<TRow> {
		const loader = new JSONLoader<TRow>(this.workRoot.testData(filename))
		return TestDataSource.getInstance().addLoader(loader)
	}
}

export class NullTestDataLoaders implements TestDataFactory {
	public fromData<TRow>(lines: TRow[]): TestDataSource<TRow> {
		return new TestDataSource<TRow>(new NullLoader())
	}
	public fromCSV<TRow>(filename: string, separator = ','): TestDataSource<TRow> {
		return new TestDataSource<TRow>(new NullLoader())
	}
	public fromJSON<TRow>(filename: string): TestDataSource<TRow> {
		return new TestDataSource<TRow>(new NullLoader())
	}
}

interface HasTestData {
	testData: TestDataSource<any>
}

export class BoundTestDataLoaders implements TestDataFactory {
	private innerLoaders: TestDataFactory

	constructor(private target: HasTestData, workRoot: WorkRoot) {
		this.innerLoaders = new TestDataLoaders(workRoot)
	}

	public fromData<TRow>(lines: TRow[]): TestDataSource<TRow> {
		return (this.target.testData = this.innerLoaders.fromData(lines))
	}

	public fromCSV<TRow>(filename: string, separator = ','): TestDataSource<TRow> {
		return (this.target.testData = this.innerLoaders.fromCSV(filename, separator))
	}

	public fromJSON<TRow>(filename: string): TestDataSource<TRow> {
		return (this.target.testData = this.innerLoaders.fromJSON(filename))
	}
}
