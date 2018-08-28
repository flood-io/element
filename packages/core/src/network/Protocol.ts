import { ResourceType } from 'puppeteer'
export interface RawResponse {
	timestamp: number
	wallTime: number
	type: ResourceType
	status: number
	url: string
	timing: Object
	frameId: string
	loaderId: string
	requestId: string
	response: {
		connectionId: number
		connectionReused: boolean
		encodedDataLength: number
		fromDiskCache: boolean
		fromServiceWorker: boolean
		headers: {}
		headersText: string
		mimeType: string
		protocol: string
		remoteIPAddress: string
		remotePort: number
		requestHeaders: {}
		requestHeadersText: string
		securityDetails: {}
		securityState: string
		status: number
		statusText: string
		timing: {
			connectEnd: number
			connectStart: number
			dnsEnd: number
			dnsStart: number
			proxyEnd: number
			proxyStart: number
			pushEnd: number
			pushStart: number
			receiveHeadersEnd: number
			requestTime: number
			sendEnd: number
			sendStart: number
			sslEnd: number
			sslStart: number
			workerReady: number
			workerStart: number
		}
		url: string
		timestamp: number
	}
}

export class Entry {
	requestId: string
	frameId: string
	loaderId: string
	startedDateTime: Date
	time: number
	type: string
	request: EntryRequest
	response: EntryResponse
	cache: {}
	timings: {
		blocked: number
		dns: number
		ssl: number
		connect: number
		send: number
		wait: number
		receive: number
		_blocked_queueing: number
	}
	serverIPAddress: string
	connection: string
	pageref: string

	constructor(attrs = {}) {
		this.request = new EntryRequest()
		this.response = new EntryResponse()
		for (let [k, v] of Object.entries(attrs)) {
			this[k] = v
		}
	}

	public toJSON() {
		return {
			requestId: this.requestId,
			startedDateTime: this.startedDateTime,
			time: this.time,
			type: this.type,
			request: this.request.toJSON(),
			response: this.response.toJSON(),
			cache: this.cache,
			timings: this.timings,
			serverIPAddress: this.serverIPAddress,
			connection: this.connection,
			pageref: this.pageref,
		}
	}
}

export class EntryRequest {
	_epoch: number = -1
	_issueTime: number = -1
	_wallIssueTime: number = -1
	_startTime: number = -1
	_endTime: number = -1
	_ttfb: number = -1
	_responseReceivedTime: number = -1
	_timing: any = {}

	timestamp: number
	method: string
	url: string
	httpVersion: string
	headers: { name: string; value: string }[]
	queryString: string[]
	headersSize: number
	bodySize: null
	postData: string
	cookies: {
		name: string
		value: string
		expires: string | null
		httpOnly: boolean
		secure: boolean
	}[]

	setIssueTime(monotonicTime, wallTime) {
		this._issueTime = monotonicTime
		this._wallIssueTime = wallTime
		this._startTime = monotonicTime
	}

	/**
	 * @param {number} monotonicTime
	 * @return {number}
	 */
	pseudoWallTime(monotonicTime: number): number {
		return this._wallIssueTime
			? this._wallIssueTime - this._issueTime + monotonicTime
			: monotonicTime
	}

	/**
	 * @param {!Protocol.Network.ResourceTiming|undefined} timingInfo
	 */
	set timing(timingInfo) {
		if (!timingInfo) return
		// Take startTime and responseReceivedTime from timing data for better accuracy.
		// Timing's requestTime is a baseline in seconds, rest of the numbers there are ticks in millis.
		this._startTime = timingInfo.requestTime * 1e3
		var headersReceivedTime = timingInfo.requestTime * 1e3 + timingInfo.receiveHeadersEnd
		if ((this._responseReceivedTime || -1) < 0 || this._responseReceivedTime > headersReceivedTime)
			this._responseReceivedTime = headersReceivedTime
		if (this._startTime > this._responseReceivedTime) this._responseReceivedTime = this._startTime

		this._ttfb = timingInfo.receiveHeadersEnd - timingInfo.sendEnd

		this._timing = timingInfo
	}

	get timing() {
		return this._timing
	}

	/**
	 * @return {number}
	 */
	get endTime() {
		return this._endTime || -1
	}

	/**
	 * @param {number} x
	 */
	set endTime(x) {
		if (this.timing && this.timing.requestTime) {
			// Check against accurate responseReceivedTime.
			this._endTime = Math.max(x, this._responseReceivedTime)
		} else {
			// Prefer endTime since it might be from the network stack.
			this._endTime = x
			if (this._responseReceivedTime > x) this._responseReceivedTime = x
		}
	}

	/**
	 * @return {number}
	 */
	get duration() {
		if (this._endTime === -1 || this._startTime === -1) return -1
		return this._endTime - this._startTime
	}

	/**
	 * @return {number}
	 */
	get latency() {
		if (this._responseReceivedTime === -1 || this._startTime === -1) return -1
		return this._responseReceivedTime - this._startTime
	}

	get ttfb() {
		return this._ttfb || -1
	}

	public toJSON() {
		return {
			timestamp: this.timestamp,
			method: this.method,
			url: this.url,
			httpVersion: this.httpVersion,
			headers: this.headers,
			queryString: this.queryString,
			headersSize: this.headersSize,
			bodySize: this.bodySize,
			cookies: this.cookies,
		}
	}
}

export class EntryResponse {
	timestamp: number
	status: number
	statusText: string
	httpVersion: string
	headers: { name: string; value: string }[]
	redirectURL: string
	headersSize: number
	bodySize: number
	_transferSize: number
	cookies: {
		name: string
		value: string
		expires: string | null
		httpOnly: boolean
		secure: boolean
		path: string
	}[]
	content: {
		size: number
		mimeType: string
		compression?: number
		text: string
	}

	public toJSON() {
		return {
			timestamp: this.timestamp,
			status: this.status,
			statusText: this.statusText,
			httpVersion: this.httpVersion,
			headers: this.headers,
			redirectURL: this.redirectURL,
			headersSize: this.headersSize,
			bodySize: this.bodySize,
			_transferSize: this._transferSize,
			cookies: this.cookies,
			content: this.content,
		}
	}
}

export class Page {
	_epoch: number
	startedDateTime: Date
	id: string
	title: string
	pageTimings: {
		onContentLoad: number
		onLoad: number
	}

	public toJSON() {
		return {
			startedDateTime: this.startedDateTime,
			id: this.id,
			title: this.title,
			pageTimings: this.pageTimings,
		}
	}
}
