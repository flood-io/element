import { sum, min, max, extent, ascending, descending } from 'd3-array'
import { randomBytes } from 'crypto'
const variableReplacementGroup = /{{\s*[\w\.\-]+\s*}}/g
const expressionReplacementGroup = /{{\s*[\w\.\-]+\(\d+\)\s*}}/g

export class AssertionFailure extends Error {}

export default class TestBuffer {
	storage: Map<string, string | string[]>

	constructor() {
		this.storage = new Map()
	}

	public has(key: string): boolean {
		return this.storage.has(key)
	}

	public get(key: string): string | string[] {
		console.assert(this.storage.has(key), `Buffer is missing key: ${key}`)
		return this.storage.get(key) as string[]
	}

	public set(key: string, value: string | string[]): void {
		this.storage.set(key, value)
	}

	public reset(): void {
		this.storage.clear()
	}

	/**
	 * Interpolates a string containing variables which match values in the buffer.
	 * @param  {string} str Input string
	 * @return {string}     Interpolated string
	 */
	public interpolate(str: string): string {
		let newStr = str
		if (!str) {
			return str
		}

		let variableMatches = str.match(variableReplacementGroup)
		let expressionMatches = str.match(expressionReplacementGroup)
		if (variableMatches) {
			variableMatches
				.map(x => x.match(/[\w\.]+/))
				.forEach(match => {
					if (this.has(match[0])) {
						Array(this.get(match[0])).forEach((r: string) => {
							newStr = newStr.replace(match.input, r)
						})
					}
				})
		}

		if (expressionMatches) {
			let matches = expressionMatches.map(x => x.match(/([\w\.]+)(\((\d+)\))/))
			matches.forEach(match => {
				if (match[1] === 'RANDOM_HEX') {
					let length = Number(match[3])
					newStr = newStr.replace(match.input, this.randomString(length))
				}
			})
		}
		return newStr
	}

	private randomString(length) {
		return randomBytes(Math.ceil(length / 2))
			.toString('hex')
			.slice(0, length)
	}

	public order(data: string[], direction: string): string[] {
		console.assert(Array.isArray(data), 'Value passed to order() must be an array')
		return data
			.map(Number)
			.sort(direction === 'asc' ? ascending : descending)
			.map(String)
	}

	public minValue(data: string[]): string {
		console.assert(Array.isArray(data), 'Value passed to min() must be an array')
		return min(data.map(Number)).toString()
	}

	public maxValue(data: string[]): string {
		console.assert(Array.isArray(data), 'Value passed to max() must be an array')
		let value = max(data.map(Number))
		return value ? value.toString() : null
	}

	public count(data: string[]): string {
		console.assert(Array.isArray(data), 'Value passed to count() must be an array')
		return data.length.toString()
	}

	public sum(data: string[]): string {
		console.assert(Array.isArray(data), 'Value passed to sum() must be an array')
		return sum(data.map(Number)).toString()
	}

	public extent(data: string[]): string[] {
		console.assert(Array.isArray(data), 'Value passed to extent() must be an array')
		return extent(data.map(Number)).map(String)
	}

	public first(data: string[]): string {
		console.assert(Array.isArray(data), 'Value passed to first() must be an array')
		return data[0]
	}

	public last(data: string[]): string {
		console.assert(Array.isArray(data), 'Value passed to last() must be an array')
		return data[data.length - 1]
	}

	public valueAtIndex(data: string[], index: number): string {
		console.assert(Array.isArray(data), 'Value passed to value-at() must be an array')
		return data[index]
	}

	public assertEqual(a: string, b: string): boolean {
		if (a === b) {
			return true
		}

		// let diff = diffChars(a, b);

		// if (diff.length === 0) {
		//   return true;
		// }

		// let desc = diff.forEach((part) => {
		//   console.log(part, part.added, part.removed);

		//   // if (part.added) {
		//   //   return `Found ${part.value}`
		//   // }
		//   // if (part.removed) {
		//   //   return `Expected ${part.value}`
		//   // }

		//   // if (!part.removed && !part.added) {
		//   //   return part.value;
		//   // }
		// });

		throw new AssertionFailure(`Expected "${a}" to equal "${b}"`)
	}

	public debug() {
		console.log(this.storage)
	}
}
