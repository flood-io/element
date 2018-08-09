import { CSVLoader, JSONLoader, DataLoader } from './Loader'
import { TestData } from './TestData'
import { WorkRoot } from '../runtime-environment/types'

export class TestDataLoaders<TRow> {
	constructor(private workRoot: WorkRoot) {}

	public fromData<TRow>(lines: TRow[]): TestData<TRow> {
		let loader = new DataLoader<TRow>(lines)
		return new TestData<TRow>(loader)
	}

	public fromCSV<TRow>(filename: string, seperator: string = ','): TestData<TRow> {
		let loader = new CSVLoader<TRow>(this.workRoot.join('test-data', 'files', filename), seperator)
		return new TestData<TRow>(loader)
	}

	public fromJSON<TRow>(filename: string): TestData<TRow> {
		let loader = new JSONLoader<TRow>(this.workRoot.join('test-data', 'files', filename))
		return new TestData<TRow>(loader)
	}
}
