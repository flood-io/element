import { readFile } from 'fs'
import { basename, extname } from 'path'
import { promisify, inspect } from 'util'
import parseCSV from 'csv-parse/lib/sync'
import glob from 'glob'

const readFilePromise = promisify(readFile)

type ReadFileOption = {
	delimiter?: string
	columns?: boolean
	type: FileType
}

export enum FileType {
	CSV = 'csv',
	JSON = 'json',
	DATA = 'data',
	NULL = 'null_loader',
}

export abstract class Loader<T> {
	public isSet = true
	public isLoaded = false
	public lines: T[]
	public dataSource: { name: string; lines: T[] }[]
	public loaderName: string
	public requestedFilename: string | string[]
	public filePaths: string[] = []

	public abstract load(): Promise<void>
	public abstract asName(name: string): void
	public abstract type(): FileType
	public async read(path: string, option: ReadFileOption): Promise<T[]> {
		let dataFile: string
		let data = []
		try {
			dataFile = await readFilePromise(path, 'utf8')
			if (option.type === FileType.CSV) {
				data = parseCSV(dataFile, option)
			} else if (option.type === FileType.JSON) {
				data = JSON.parse(dataFile)
			}
		} catch (e) {
			throw new Error(`unable to read file ${this.filePath}:\ncause: ${e}`)
		}
		return data
	}

	public validStructure(lines: T[]): boolean {
		const keys: string[] = []
		let isValid = true
		for (const line of lines) {
			if (keys.length === 0) keys.push(...Object.keys(line))
			else {
				const lineKeys = Object.keys(line)
				isValid =
					keys.length === lineKeys.length && keys.every((key: string) => lineKeys.includes(key))
				if (!isValid) return isValid
			}
		}
		return isValid
	}

	constructor(public filePath: string) {
		if (filePath.includes('*')) {
			this.filePaths.push(...glob.sync(filePath))
			if (this.filePaths.length === 0) {
				throw Error('Found no test scripts matching testPathMatch pattern')
			}
			this.requestedFilename = this.filePaths
				.map((file) => basename(file, extname(file)).replace(/\*/gi, ''))
				.join(',')
		} else {
			this.requestedFilename = basename(this.filePath)
		}
		this.loaderName = basename(filePath, extname(filePath)).replace(/\*/gi, '')
	}
}

export class NullLoader<T> extends Loader<T> {
	constructor() {
		super('')
		this.lines = []
		this.isLoaded = true
		this.isSet = false
	}
	public async load(): Promise<void> {
		this.isLoaded = true
	}

	public asName(name = ''): void {
		this.loaderName = name
	}

	public type(): FileType {
		return FileType.NULL
	}
}

export class DataLoader<T> extends Loader<T> {
	constructor(public lines: T[]) {
		super('')
		if (lines.length === 1 && Object.keys(lines[0]).length === 0) {
			this.isSet = false
		}
	}

	public async load(): Promise<void> {
		this.isLoaded = true
	}

	public asName(name = ''): void {
		this.loaderName = name
	}

	public type(): FileType {
		return FileType.DATA
	}

	public toString(): string {
		let s = 'inline data\n'

		const pp = inspect
		const show = Math.min(4, this.lines.length)

		switch (this.lines.length) {
			case 0:
				s += '<empty>'
				break
			default:
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
	constructor(public filePath: string) {
		super(filePath)
	}

	private async processData(path: string): Promise<T[]> {
		const data = await this.read(path, { type: FileType.JSON })
		if (Array.isArray(data)) return data
		else return [data]
	}

	public async load(): Promise<void> {
		if (this.filePaths.length) {
			const allLines: T[] = []
			for (const filePath of this.filePaths) {
				const data = await this.processData(filePath)
				allLines.push(...data)
			}
			this.lines = allLines
		} else {
			this.lines = await this.processData(this.filePath)
		}

		if (this.lines.length === 0) {
			throw new Error(`JSON file '${this.requestedFilename}' loaded but contains no rows of data.`)
		}

		if (!this.validStructure(this.lines)) {
			throw Error(`Data files that have different data structures cannot have the same alias`)
		}

		this.isLoaded = true
	}

	public asName(name = ''): void {
		this.loaderName = name
	}

	public toString(): string {
		return `json data ${this.requestedFilename}`
	}

	public type(): FileType {
		return FileType.JSON
	}
}

export class CSVLoader<T> extends Loader<T> {
	constructor(public filePath: string, private separator: string = ',') {
		super(filePath)
	}

	public async load(): Promise<void> {
		const option = {
			type: FileType.CSV,
			delimiter: this.separator,
			columns: true,
		}
		if (this.filePaths.length) {
			const allLines: T[] = []
			for (const filePath of this.filePaths) {
				const data = await this.read(filePath, option)
				allLines.push(...data)
			}
			this.lines = allLines
		} else {
			this.lines = await this.read(this.filePath, option)
		}

		if (this.lines.length === 0) {
			throw new Error(
				`CSV file '${this.requestedFilename}' loaded but contains no rows of data.\nNote that the first row of a CSV file is used as the header to name columns.\nFor details see https://github.com/flood-io/element/blob/main/packages/element/docs/examples/examples_test_data.md#csv-column-names`
			)
		}

		if (!this.validStructure(this.lines)) {
			throw Error(`Data files that have different data structures cannot have the same alias`)
		}

		this.isLoaded = true
	}

	public asName(name: string): void {
		this.loaderName = name
	}

	public toString(): string {
		return `CSV data ${this.requestedFilename}`
	}

	public type(): FileType {
		return FileType.CSV
	}
}
