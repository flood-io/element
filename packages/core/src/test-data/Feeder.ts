import { Option } from '../utils/Option'
import { knuthShuffle } from 'knuth-shuffle'

export type FeedFilterFunction<Line> = (line: Line, index: number, instanceID: string) => boolean

type DataSourceItem = {
	name: string
	lines: any[]
	circular: boolean
	shuffle: boolean
	pointer: number
}
type DataSource = DataSourceItem[]

export class Feeder<T> {
	private dataSource: DataSource = []
	private dataConfig: { loaderName: string; circular: boolean; shuffle: boolean }[] = []

	constructor(public instanceID: string = '', private filters: FeedFilterFunction<T>[] = []) {
		this.reset()
	}

	private static _instance: Feeder<any>
	public static getInstance() {
		return this._instance || (this._instance = new Feeder<any>())
	}

	public append(lines: T[], loaderName = ''): Feeder<T> {
		const { instanceID } = this

		if (!lines || lines.length === 0) return this

		const newLines = lines.filter((line, index) =>
			this.filters.every(func => func(line, index, instanceID)),
		)
		const source = this.dataSource.filter(source => source.name === loaderName)
		const { circular, shuffle } = this.dataConfig.reduce(
			(result, config) => {
				if (config.loaderName === loaderName)
					return { circular: config.circular, shuffle: config.shuffle }
				return result
			},
			{ circular: true, shuffle: false },
		)

		if (source.length > 0) {
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
			})
		}
		return this
	}

	/**
	 * Configures the feeder to reset at the end, creating a repeating loop
	 */
	public circular(circular = true, loaderName = ''): Feeder<T> {
		const loader = this.dataConfig.filter(config => config.loaderName === loaderName)
		if (loader.length) loader[0].circular = circular
		else this.dataConfig.push({ loaderName, circular, shuffle: false })
		return this
	}

	public shuffle(shuffle = true, loaderName = ''): Feeder<T> {
		const loader = this.dataConfig.filter(config => config.loaderName === loaderName)
		if (loader.length) loader[0].shuffle = shuffle
		else this.dataConfig.push({ loaderName, circular: true, shuffle })
		return this
	}

	public filter(func: FeedFilterFunction<T>): Feeder<T> {
		this.filters.push(func)
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
		const arrLines = this.dataSource.reduce((result: number[], item: DataSourceItem) => {
			result.push(item.lines.length)
			return result
		}, [])
		return arrLines.reduce((a, b) => Math.max(a, b))
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
