import { readFile } from 'fs'
import { promisify, inspect } from 'util'
import parseCSV from 'csv-parse/lib/sync'

const readFilePromise = promisify(readFile)

export abstract class Loader<T> {
	public isSet = true
	public lines: T[]
	public isLoaded = false
	constructor(public filePath: string, public requestedFilename: string) {}
	public abstract load(): Promise<void>
}

export class NullLoader<T> extends Loader<T> {
	constructor() {
		super('', '')
		this.lines = []
		this.isLoaded = true
		this.isSet = false
	}
	public async load(): Promise<void> {
		this.isLoaded = true
	}
}

export class DataLoader<T> extends Loader<T> {
	constructor(public lines: T[]) {
		super('', '')

		// handle init via TestData.fromData([{}]) to represent a
		// working-but-useless placeholder loader
		// TODO improve this degenerate case
		if (lines.length === 1 && Object.keys(lines[0]).length === 0) {
			this.isSet = false
		}
	}

	public async load(): Promise<void> {
		this.isLoaded = true
	}

	public toString(): string {
		let s = 'inline data\n'

		const pp = inspect

		switch (this.lines.length) {
			case 0:
				s += '<empty>'
				break
			default:
				const show = Math.min(4, this.lines.length)
				s += `[\n`
				for (let i = 0; i < show; i++) {
					s += `  ${pp(this.lines[i])},\n`
				}
				if (this.lines.length > show) {
					const extra = this.lines.length - show
					s += `  ... (${extra} more row${extra !== 1 ? 's' : ''})\n`
				}
				s += ']'
		}

		return s
	}
}

export class JSONLoader<T> extends Loader<T> {
	public async load(): Promise<void> {
		const data = readFilePromise(this.filePath, 'utf8')
		data.catch(err => {
			console.debug(err)
		})

		const jsonData: T[] = JSON.parse(await data)
		if (Array.isArray(jsonData)) {
			this.lines = jsonData
		} else {
			this.lines = [jsonData]
		}

		if (this.lines.length === 0) {
			throw new Error(`JSON file '${this.requestedFilename}' loaded but contains no rows of data.`)
		}

		this.isLoaded = true
	}

	public toString(): string {
		return `json data ${this.requestedFilename}`
	}
}

export class CSVLoader<T> extends Loader<T> {
	constructor(public filePath: string, private separator: string = ',', requestedFilename: string) {
		super(filePath, requestedFilename)
	}

	public async load(): Promise<void> {
		let data: string
		try {
			data = await readFilePromise(this.filePath, 'utf8')
		} catch (e) {
			throw new Error(`unable to read CSV file ${this.filePath}:\ncause: ${e}`)
		}

		this.lines = parseCSV(data, { delimiter: this.separator, columns: true })

		if (this.lines.length === 0) {
			throw new Error(
				`CSV file '${this.requestedFilename}' loaded but contains no rows of data.\nNote that the first row of a CSV file is used as the header to name columns.\nFor details see https://github.com/flood-io/element/blob/master/packages/element/docs/examples/examples_test_data.md#csv-column-names`,
			)
		}

		this.isLoaded = true
	}

	public toString(): string {
		return `CSV data ${this.requestedFilename}`
	}
}
