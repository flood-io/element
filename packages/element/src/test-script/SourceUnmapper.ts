import { SourceMapConsumer } from 'source-map'

export interface Callsite {
	file: string
	code: string
	line: number
	column: number
}

interface StackLine {
	at: string
	file: string
	line: number
	column: number
}

export function callsiteToString(callsite: Callsite | undefined): string {
	if (callsite) {
		return (
			callsite.file +
			':' +
			callsite.line +
			'\n' +
			callsite.code +
			'\n' +
			new Array(callsite.column).join(' ') +
			'^'
		)
	}

	return ''
}

// inspiration from:
// https://github.com/evanw/node-source-map-support
export class SourceUnmapper {
	// can't have async constructors, so:
	public static async init(originalSource: string, originalFilename: string, sourceMap: string) {
		const sourceMapConsumer = await new SourceMapConsumer(sourceMap)

		return new SourceUnmapper(originalSource, originalFilename, sourceMapConsumer)
	}

	constructor(
		private originalSource: string,
		private originalFilename: string,
		private sourceMapConsumer: SourceMapConsumer,
	) {}

	public unmapNodeStackLine(stackLine: string): string {
		return callsiteToString(this.unmapCallsite(stackLine))
	}

	public unmapCallsite(stackLine: string): Callsite | undefined {
		const match = /\s+at [^(]+ \((.*?):(\d+):(\d+)\)/.exec(stackLine)
		if (match) {
			const pos = { source: match[1], line: +match[2], column: +match[3] }
			const originalPos = this.sourceMapConsumer.originalPositionFor(pos)
			const code = this.extractSourceLine(originalPos)

			return {
				file: this.originalFilename,
				code: code,
				line: originalPos.line,
				column: originalPos.column,
			}
		} else {
			return undefined
		}
	}

	public unmapStack(stack: string[]): StackLine[] {
		return this.parseStack(stack).map(s => this.originalPositionFor(s))
	}

	public parseStack(stack: string[]): StackLine[] {
		return stack
			.map(s => /\s+at ([^(]+) \((.*?):(\d+):(\d+)\)/.exec(s))
			.filter(x => x)
			.map(match => ({ at: match[1], file: match[2], line: +match[3], column: +match[4] }))
	}

	public originalPositionFor(pos: StackLine): StackLine {
		const originalPos = this.sourceMapConsumer.originalPositionFor({
			line: pos.line,
			column: pos.column,
		})

		return {
			at: pos.at,
			file: this.originalFilename,
			line: originalPos.line,
			column: originalPos.column,
		}
	}

	public unmapStackNodeStrings(stack: string[]): string[] {
		const unmapped = this.unmapStack(stack)
		return unmapped.map(this.stackLineToNodeString)
	}

	public extractSourceLine(m: { line: number }): string {
		return this.originalSource.split(/(?:\r\n|\r|\n)/)[m.line - 1]
	}

	public stackLineToNodeString(m: StackLine): string {
		return `    at ${m.at} ${m.file}:${m.line}:${m.column}`
	}
}
