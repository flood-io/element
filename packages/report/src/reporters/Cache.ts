import { EventEmitter } from 'events'

interface OutputCache {
	message: string
	heigth: number
}
export class ReportCache {
	private _cache: OutputCache[]

	constructor(private myEmitter: EventEmitter) {
		this._cache = []
		const addCache = (message: string, heigth: number) => {
			Array.prototype.push.call(this._cache as [], {
				message,
				heigth,
			})
		}
		this.myEmitter.on('add', addCache)
	}

	getLinesBetweenCurrentAndPreviousMessage(previousMessage: string): number {
		const previousOutput = this.findMessageInCache(previousMessage)
		if (previousOutput) {
			const previousIndex = this._cache.indexOf(previousOutput)
			let line = 0
			for (let i = previousIndex; i < this._cache.length; i++) {
				line += this._cache[i].heigth
			}
			return line
		}
		return 1
	}

	updateMessageInCache(previousMessage: string, newMessage: string): void {
		const latestOutput = this.findMessageInCache(newMessage)
		const previousOutput = this.findMessageInCache(previousMessage)
		if (latestOutput && previousOutput) {
			const previousIndex = this._cache.indexOf(previousOutput)
			this._cache[previousIndex] = latestOutput
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
