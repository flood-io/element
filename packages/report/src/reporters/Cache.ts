import { EventEmitter } from 'events'

interface OutputCache {
	message: string
	heigth: number
	line: number
}
export class ReportCache {
	private _cache: OutputCache[]

	constructor(private myEmitter: EventEmitter) {
		this._cache = []
		const addCache = (line: number, heigth: number, message: string) => {
			Array.prototype.push.call(this._cache as [], {
				message,
				heigth,
				line,
			})
		}
		this.myEmitter.on('add', addCache)
	}

	getLinesBetweenCurrentAndPreviousMessage(previousMessage: string): number {
		const latestOutput = this.getLatestMessageInCache()
		const previousOutput = this.findMessageInCache(previousMessage)
		if (previousOutput) {
			const latestLine = latestOutput.line + (latestOutput.heigth - 1)
			const height = latestLine - previousOutput.line + 1
			return height
		}
		return 0
	}

	updateMessageInCache(previousMessage: string, newMessage: string): void {
		const latestOutput = this.findMessageInCache(newMessage)
		const previousOutput = this.findMessageInCache(previousMessage)
		if (latestOutput && previousOutput) {
			const previousIndex = this._cache.indexOf(previousOutput)
			this._cache[previousIndex] = {
				message: latestOutput.message,
				heigth: latestOutput.heigth,
				line: previousOutput.line,
			}
			this.myEmitter.emit('update', latestOutput.line - 1)
			this._cache.pop()
		}
	}

	findMessageInCache(subMessage: string): OutputCache | undefined {
		return this._cache.find(output => output.message.includes(subMessage))
	}

	getLatestMessageInCache(): OutputCache {
		return this._cache[this._cache.length - 1]
	}

	getCache(): OutputCache[] {
		return this._cache
	}

	resetCache(): void {
		this._cache = []
	}
}
