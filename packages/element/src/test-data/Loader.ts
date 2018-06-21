import { readFile } from 'fs'
import { promisify } from 'util'
import * as parseCSV from 'csv-parse/lib/sync'

const readFilePromise = promisify(readFile)

export abstract class Loader<T> {
	public lines: T[]
	public isLoaded: boolean = false
	constructor(public filePath: string) {}
	public abstract load(): Promise<void>
}

export class DataLoader<T> extends Loader<T> {
	constructor(public lines: T[]) {
		super(null)
	}
	public async load(): Promise<void> {
		this.isLoaded = true
	}
}

export class JSONLoader<T> extends Loader<T> {
	public async load(): Promise<void> {
		let data = readFilePromise(this.filePath, 'utf8')
		data.catch(err => {
			console.error(err)
		})

		let jsonData: T[] = JSON.parse(await data)
		if (Array.isArray(jsonData)) {
			this.lines = jsonData
		} else {
			this.lines = [jsonData]
		}

		this.isLoaded = true
	}
}

export class CSVLoader<T> extends Loader<T> {
	constructor(public filePath: string, private separator: string = ',') {
		super(filePath)
	}

	public async load(): Promise<void> {
		let data = await readFilePromise(this.filePath, 'utf8')

		this.lines = parseCSV(data, { delimiter: this.separator, columns: true })
		this.isLoaded = true
	}
}
