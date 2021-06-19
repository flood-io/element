import { Browser, Command, Action } from '../../src/types'
declare const Promise: any
import * as EventEmitter from 'events'

export default class DummyDriver extends EventEmitter implements Browser {
	processedCommands: Array<Command | Action>
	commandMap: Map<string, Function>

	constructor() {
		super()
		this.processedCommands = []

		this.commandMap = new Map<string, Function>([
			['visit', () => 1],
			['click', () => 2],
			['select', () => 3],
			['select-by-value', () => 4],
			['select-by-index', () => 5],
			['select-by-text', () => 6],
			['clear-select', () => 7],
			['clear-input', () => 8],
			['type', () => 9],
			['find-element-with-text', () => 10],
			['wait-for-element', () => 11],
			['wait-for-element-present', () => 12],
			['screenshot', () => 13],
			['extract-text', () => 14],
			['extract-text-all', () => 15],
			['wait-for-navigation', () => 16],
			['go-forward', () => 17],
			['go-back', () => 18],
			['reload', () => 19],
		])
	}

	async process<T extends any>(command: Action): Promise<T> {
		this.processedCommands.push(command as Action)

		if (this.commandMap.has(command.type)) {
			return this.commandMap.get(command.type)(...command.arguments)
		} else {
			return Promise.reject(`Unknown command: ${command.type}`)
		}
	}

	async afterInit(): Promise<void> {
		return
	}

	async performanceTiming(): Promise<PerformanceTiming> {
		const epoch = new Date().valueOf()

		return {
			responseStart: epoch + 1e3,
			loadEventEnd: epoch + 300,
			navigationStart: epoch,
			connectEnd: epoch + 100,
			connectStart: epoch + 50,
			domComplete: epoch + 1200,
			domContentLoadedEventEnd: epoch,
			domContentLoadedEventStart: epoch,
			domInteractive: epoch,
			domLoading: epoch,
			domainLookupEnd: epoch,
			domainLookupStart: epoch,
			fetchStart: epoch,
			loadEventStart: epoch,
			msFirstPaint: epoch,
			redirectEnd: epoch,
			redirectStart: epoch,
			requestStart: epoch,
			responseEnd: epoch,
			secureConnectionStart: epoch,
			unloadEventEnd: 0,
			unloadEventStart: 0,
			toJSON() {
				return this
			},
		}
	}

	close(): Promise<void> {
		return Promise.resolve()
	}
}
