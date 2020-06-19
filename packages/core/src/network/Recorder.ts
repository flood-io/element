import { sum, mean } from 'd3-array'
import { Page as PlaywrightPage, ChromiumBrowserContext } from 'playwright'
import { Entry, RawResponse, EntryRequest, Page, EntryResponse } from './Protocol'
import { AsyncQueue } from '../utils/AsyncQueue'
import { Manager } from './Manager'
import debugFactory from 'debug'
const debug = debugFactory('element:network:recorder')

export type ResourceType =
	| 'document'
	| 'stylesheet'
	| 'image'
	| 'media'
	| 'font'
	| 'script'
	| 'texttrack'
	| 'xhr'
	| 'fetch'
	| 'eventsource'
	| 'websocket'
	| 'manifest'
	| 'other'

export type PageEvents =
	| 'load'
	| 'close'
	| 'console'
	| 'crash'
	| 'dialog'
	| 'domcontentloaded'
	| 'download'
	| 'filechooser'
	| 'frameattached'
	| 'framedetached'
	| 'framenavigated'
	| 'pageerror'
	| 'popup'
	| 'request'
	| 'requestfailed'
	| 'requestfinished'
	| 'response'
	| 'worker'

function round(value: number): number {
	return Math.round(value * 1000) / 1000
}

function justNumber(value: number | undefined, defaultValue: number): number {
	if (value === undefined) {
		return defaultValue
	} else {
		return value
	}
}

export default class Recorder {
	public entries: Entry[]
	private pages: Page[]
	public pendingTaskQueue: AsyncQueue<any>
	public manager: Manager

	constructor(public page: PlaywrightPage) {
		this.reset()
		this.pendingTaskQueue = new AsyncQueue()
		this.manager = new Manager(page)
	}

	public toJSON() {
		return {
			log: {
				version: '1.2',
				creator: { name: 'Flood Chrome', version: '1.0.0' },
				pages: this.pages,
				entries: this.entries.map(e => e.toJSON()),
			},
		}
	}

	public async sync() {
		debug('Recorder.sync() (pendingTaskQueue.chain)')
		await this.pendingTaskQueue.chain
	}

	public async recordRequest(payload: any) {
		debug('Recorder.recordRequest(%o)', payload)

		// let pageRef = this.nextPageId
		const pageRef = payload.frameId
		const timestamp = payload.wallTime * 1e3
		const basetime = timestamp - payload.timestamp * 1e3

		if (payload.request.url.startsWith('data:')) {
			return
		}

		const entry = new Entry({
			type: payload.type,
			requestId: payload.requestId,
		})
		entry.pageref = pageRef
		entry.request = new EntryRequest()
		entry.request.setIssueTime(payload.timestamp * 1e3, payload.wallTime * 1e3)
		entry.request.method = payload.request.method
		entry.request.url = payload.request.url
		entry.request.timestamp = timestamp
		entry.request._epoch = basetime
		entry.request.postData = ''
		entry.frameId = payload.frameId
		entry.loaderId = payload.loaderId
		this.entries.push(entry)

		if (payload.type === 'Document') {
			this.recordPageResponse({
				_epoch: basetime,
				id: pageRef,
				startedDateTime: new Date(timestamp),
				title: payload.documentURL,
				pageTimings: {
					onContentLoad: 0,
					onLoad: 0,
				},
			} as Page)
		}
	}

	public async recordResponse(payload: RawResponse) {
		const entry = this.getEntryForRequestId(payload.requestId)
		if (!entry) return

		entry.type = payload.type

		// Update request
		entry.request.timing = payload.response.timing
		entry.request.endTime = payload.timestamp * 1e3

		// Create Response
		entry.response = new EntryResponse()
		entry.response.timestamp = entry.request.pseudoWallTime(payload.timestamp * 1e3)
		entry.serverIPAddress = payload.response.remoteIPAddress
		entry.connection = payload.response.connectionId.toString()

		if (payload.response.requestHeaders) {
			entry.request.headers = Object.entries<string>(payload.response.requestHeaders).map(
				([k, v]) => ({
					name: k,
					value: v.toString(),
				}),
			)
		}

		if (payload.response && payload.response.requestHeadersText) {
			entry.request.headersSize = payload.response.requestHeadersText.length
		}
		entry.request.httpVersion = payload.response.protocol

		// Response
		entry.response.headers = Object.entries<string>(payload.response.headers).map(([k, v]) => ({
			name: k,
			value: v.toString(),
		}))

		if (payload.response.headersText) {
			entry.response.headersSize = payload.response.headersText.length
		}
		entry.response.content = { mimeType: payload.response.mimeType, text: '', size: 0 }

		entry.response.bodySize = payload.response.encodedDataLength
		entry.response.httpVersion = payload.response.protocol
		entry.response.status = payload.response.status
		entry.response.statusText = payload.response.statusText
	}

	public async recordResponseCompleted({
		requestId,
		encodedDataLength,
		timestamp,
	}: {
		requestId: string
		encodedDataLength: number
		timestamp: number
	}) {
		debug(`Recorder.recordResponseCompleted: ${requestId}`)
		const entry = this.getEntryForRequestId(requestId)
		if (!entry) {
			return
		}

		const epoch = entry.request._epoch

		entry.response.bodySize = encodedDataLength
		entry.response.timestamp = epoch + timestamp * 1e3
	}

	/**
	 * Returns the recorded entries for the given Document Type
	 *
	 * @param {string} documentType
	 * @returns {Entry[]}
	 * @memberof NetworkRecorder
	 */
	entriesForType(documentType: string): Entry[] {
		return this.entries.filter(({ type }) => type === documentType)
	}

	/**
	 * Returns the response code for the last document request
	 *
	 * @readonly
	 * @type {number}
	 * @memberof NetworkRecorder
	 */
	public get documentResponseCode(): number {
		const [page] = this.pages
		if (page) {
			const entries = this.entriesForPage(page)
			const entry = entries.find(entry => String(entry.type) === 'Document')
			if (entry) return entry.response.status
		}

		return 0
	}

	public entriesForPage(page: Page): Entry[]
	public entriesForPage(pageId: string): Entry[]
	public entriesForPage(page: any): Entry[] {
		if (typeof page === 'string') {
			page = this.pages.find(({ id }) => id === page)
		}

		return this.entries.filter(entry => entry.pageref === page.id)
	}

	/**
	 * Returns total network throuhgput for a specific response type
	 * @param  {ResourceType} type
	 * @return {number}
	 */
	public networkThroughputByType(type: ResourceType): number {
		const entries = this.entries.map(entry => entry.response.bodySize)
		return sum(entries)
	}

	/**
	 * Returns the total network throughput for all requests
	 *
	 * @returns {number}
	 * @memberof NetworkRecorder
	 */
	public networkThroughput(): number {
		const entries = this.entries.map(entry => entry.response.bodySize)
		return round(sum(entries))
	}

	public responseTime(): number {
		return round(sum(this.entries.map(({ request }) => request.duration)))
	}

	public meanResponseTime(): number {
		return justNumber(mean(this.entries.map(({ request }) => request.duration)), 0)
	}

	public responseTimeForType(type: string) {
		const entries = this.entriesForType(type).filter(({ request }) => request.duration > 0)
		return round(sum(entries.map(({ request, response }) => request.duration)))
	}

	public latencyForType(type: string) {
		const entries = this.entriesForType(type).filter(({ request }) => request.latency > 0)
		return round(sum(entries.map(({ request, response }) => request.latency)))
	}

	public timeToFirstByteForType(type: string) {
		const entries = this.entriesForType(type).filter(({ request }) => request.ttfb > 0)
		return round(sum(entries.map(({ request, response }) => request.ttfb)))
	}

	public reset() {
		debug('Recorder.reset()')
		this.entries = []
		this.pages = []
	}

	public addPendingTask(promise: Promise<any>) {
		this.pendingTaskQueue.add(promise)
	}

	public recordDOMContentLoadedEvent() {}

	/**
	 * Attaches an event to the Pupeteer page or internal client
	 *
	 * @param {(playwright.PageEvents)} pageEvent
	 * @param {(event: any) => void} handler
	 */
	public attachEvent(pageEvent: any, handler: (event?: any) => void) {
		/**
		 * NOTES
		 * add event handle for page
		 */
		// if (pageEvent.includes('.')) {
		// 	;(this.page as any)['_client'].on(pageEvent, handler)
		// } else {
		this.page.on(pageEvent, handler)
		// }
	}

	private recordPageResponse(payload: Page) {
		this.pages.push(payload)
	}

	private getEntryForRequestId(requestId: string) {
		return this.entries.find(entry => entry.requestId === requestId)
	}

	private async privateClientSend(method: any, ...args: any[]): Promise<any> {
		const client = await (this.page.context() as ChromiumBrowserContext).newCDPSession(this.page)
		return client.send(method, ...args)
	}

	public async getResponseData(requestId: string): Promise<Buffer> {
		debug(`Recorder.getResponseData: ${requestId}`)
		try {
			const response = await this.privateClientSend('Network.getResponseBody', {
				requestId,
			})
			return Buffer.from(response.body, response.base64Encoded ? 'base64' : 'utf8')
		} catch (err) {
			console.error(`Recorder.getResponseData: ${err.message}`)
			return Buffer.from('', 'utf8')
		}
	}
}
