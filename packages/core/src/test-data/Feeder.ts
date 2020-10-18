import { Option } from '../utils/Option'
import { knuthShuffle } from 'knuth-shuffle'
import { FileType } from './Loader'

export type FeedFilterFunction<Line> = (line: Line, index: number, instanceID: string) => boolean

type DataSourceItem = {
	name: string
	lines: any[]
	circular: boolean
	shuffle: boolean
	pointer: number
	type: FileType
}
type DataSource = DataSourceItem[]
type LoaderConfig = {
	loaderName: string
	circular: boolean
	shuffle: boolean
	filters: FeedFilterFunction<any>[]
}

export class Feeder<T> {
	private dataSource: DataSource = []
	private dataConfig: LoaderConfig[] = []

	constructor(public instanceID = '') {
		this.reset()
	}

	private static _instance: Feeder<any>
	public static getInstance() {
		return this._instance || (this._instance = new Feeder<any>())
	}

	public append(lines: T[], loaderName = '', type: FileType): Feeder<T> {
		const { instanceID } = this

		if (!lines || lines.length === 0) return this

		let loader = this.loaderBy(loaderName)[0]
		if (!loader) loader = this.config(loaderName)

		const { filters = [], circular = true, shuffle = false } = loader
		const newLines = lines.filter((line, index) =>
			filters.every(func => func(line, index, instanceID)),
		)

		function diffStructure(src1: any, src2: any, type: FileType): boolean {
			if (type === FileType.CSV) {
				return JSON.stringify(src1.shift()) !== JSON.stringify(src2.shift())
			} else if (type === FileType.JSON) {
				//Not yet implement
				return false
			}
			return false
		}

		const source = this.dataSource.filter(source => source.name === loaderName)
		if (source.length > 0) {
			if (source[0].type === type && diffStructure(source[0].lines, newLines, source[0].type)) {
				throw Error('Data files that have different data structures cannot have the same alias')
			}
			if (shuffle) source[0].lines = knuthShuffle([...source[0].lines, ...newLines])
			else source[0].lines = [...source[0].lines, ...newLines]
			source[0].circular = circular
			source[0].shuffle = shuffle
		} else {
			this.dataSource.push({
				name: loaderName,
				lines: shuffle ? [...knuthShuffle(newLines)] : [...newLines],
				circular,
				shuffle,
				pointer: 0,
				type,
			})
		}
		return this
	}

	private loaderBy(loaderName: string): LoaderConfig[] {
		return this.dataConfig.filter(config => config.loaderName === loaderName)
	}

	private config(loaderName: string): LoaderConfig {
		const loader = this.loaderBy(loaderName)
		if (loader.length) loader[0].loaderName = loaderName
		else this.dataConfig.push({ loaderName, circular: true, shuffle: false, filters: [] })
		return this.dataConfig[this.dataConfig.length - 1]
	}

	public configLoaderName(loaderName: string, oldName: string): void {
		const loader = this.loaderBy(oldName)
		if (loader.length) loader[0].loaderName = loaderName
		else this.dataConfig.push({ loaderName, circular: true, shuffle: false, filters: [] })
	}

	/**
	 * Configures the feeder to reset at the end, creating a repeating loop
	 */
	public circular(circular = true, loaderName = ''): Feeder<T> {
		const loader = this.loaderBy(loaderName)
		if (loader.length) loader[0].circular = circular
		else this.dataConfig.push({ loaderName, circular, shuffle: false, filters: [] })
		return this
	}

	public shuffle(shuffle = true, loaderName = ''): Feeder<T> {
		const loader = this.loaderBy(loaderName)
		if (loader.length) loader[0].shuffle = shuffle
		else this.dataConfig.push({ loaderName, circular: true, shuffle, filters: [] })
		return this
	}

	public filter(func: FeedFilterFunction<T>, loaderName = ''): Feeder<T> {
		const loader = this.loaderBy(loaderName)
		if (loader.length) loader[0].filters.push(func)
		else this.dataConfig.push({ loaderName, circular: true, shuffle: false, filters: [func] })
		return this
	}

	/**
	 * Advances the feed by one iteration
	 */
	public feed(): Option<T> {
		return this.peek()
	}

	/**
	 * Reads the data at the current cursor without advancing
	 */
	public peek(): Option<T> {
		if (this.dataSource.length === 1) {
			const dataSource = this.dataSource[0]
			const dataRow = dataSource.lines[dataSource.pointer++] || null
			if (dataRow) return dataRow
			else if (dataSource.circular) {
				dataSource.pointer = 0
				return dataSource.lines[dataSource.pointer++] || null
			}
			return dataRow
		} else {
			const data: any = {}
			this.dataSource.forEach((item: DataSourceItem) => {
				const { name, lines, circular } = item
				const dataRow = lines[item.pointer++] || null
				if (dataRow) data[name] = dataRow
				else if (circular) {
					item.pointer = 0
					data[name] = lines[item.pointer++]
				} else {
					data[name] = dataRow
				}
			})
			return data
		}
	}

	public clear(): void {
		this.dataSource = []
		this.dataConfig = []
	}

	public reset(): void {
		this.dataSource.forEach(source => {
			source.pointer = 0
		})
	}

	public get size(): number {
		return this.dataSource.reduce((size: number, item: DataSourceItem) => {
			size += item.lines.length
			return size
		}, 0)
	}

	private get maxLines(): number {
		return this.dataSource.reduce((maxLine: number, item: DataSourceItem) => {
			if (item.lines.length > maxLine) maxLine = item.lines.length
			return maxLine
		}, 0)
	}

	public get isComplete(): boolean {
		const maxPointer = this.dataSource.reduce((max, source) => {
			if (source.pointer > max) max = source.pointer
			return max
		}, 0)
		return maxPointer >= this.maxLines - 1
	}

	public get isStart(): boolean {
		return this.dataSource.filter(source => source.pointer > 0).length === 0
	}

	public get isEmpty(): boolean {
		return this.dataSource.filter((item: DataSourceItem) => item.lines.length > 0).length === 0
	}

	public toString(): string {
		let str: string[] = []

		this.dataSource.forEach((item: DataSourceItem, idx: number) => {
			const { name, circular, shuffle } = item
			if (idx > 0) {
				str = [this.dataSource[0].name, ...str]
				str.push(name)
			}
			if (shuffle) str.push('shuffled')
			if (!circular) str.push('non-circular')
		})

		return str.join(', ')
	}
}
