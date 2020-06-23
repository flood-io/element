import { Page, ChromiumBrowserContext } from 'playwright'

interface RequestEvent {
	requestId: string
}

interface Event extends RequestEvent {
	request: { url: string }
	type: string
	frameId: string

	redirectResponse: any
}

export class Manager {
	private lifecycleCompleteCallback: (() => void) | null
	private networkIdlePromise: Promise<any> | null
	public timeout = 10e3

	constructor(private page: Page, private requestIdToRequest = new Map<string, any>()) {}

	public async getIdlePromise(): Promise<void> {
		console.log('get idle promise')
		this.createIdlePromise()

		return this.networkIdlePromise
	}

	public get pendingRequestCount() {
		return this.requestIdToRequest.size
	}

	private updateIdlePromise() {
		if (this.pendingRequestCount <= 2 && this.lifecycleCompleteCallback) {
			this.lifecycleCompleteCallback.apply(this)
			this.networkIdlePromise = null
			this.lifecycleCompleteCallback = null
			console.log(`Idle promise callback fired`)
		}
	}

	private createTimeoutPromise() {
		return new Promise(fulfill => setTimeout(fulfill, this.timeout))
	}

	private createIdlePromise() {
		if (this.lifecycleCompleteCallback) return
		if (this.networkIdlePromise) return

		const lifecycleCompletePromise = new Promise(fulfill => {
			this.lifecycleCompleteCallback = fulfill
		})

		this.networkIdlePromise = Promise.race([lifecycleCompletePromise, this.createTimeoutPromise()])
		this.updateIdlePromise()
	}

	public async attachEvents() {
		/**
		 * NOTES
		 * should update this for playwright
		 */
		try {
			const browserContext = this.page.context() as ChromiumBrowserContext
			const client = await browserContext.newCDPSession(this.page)
			if (client) {
				client.on('Network.requestWillBeSent', this.onRequestWillBeSent.bind(this))
				client.on('Network.requestIntercepted', this.onRequestIntercepted.bind(this))
				client.on('Network.responseReceived', this.onResponseReceived.bind(this))
				client.on('Network.loadingFinished', this.onLoadingFinished.bind(this))
				client.on('Network.loadingFailed', this.onLoadingFailed.bind(this))
			}
		} catch (err) {
			console.warn('This browser does not support CDPSession')
		}
	}

	private onRequestWillBeSent(event: Event): void {
		this.handleRequestStart(
			event.requestId,
			event.request.url,
			event.type,
			event.request,
			event.frameId,
		)
	}

	private handleRequestStart(
		requestId: string,
		url: string,
		resourceType: string,
		requestPayload: any,
		frameId: string,
	) {
		if (requestId) this.requestIdToRequest.set(requestId, null)
	}

	private onRequestIntercepted(): void {
		console.log('RequestIntercepted')
		this.updateIdlePromise()
	}

	private onResponseReceived() {
		this.updateIdlePromise()
	}

	private onLoadingFinished(event: any) {
		// const request = this.requestIdToRequest.get(event.requestId)
		this.requestIdToRequest.delete(event.requestId)
		this.updateIdlePromise()
		// console.log(`Pending requests: ${this.pendingRequestCount}`)
	}

	private onLoadingFailed(event: RequestEvent) {
		const request = this.requestIdToRequest.get(event.requestId)
		// For certain requestIds we never receive requestWillBeSent event.
		// @see https://crbug.com/750469
		if (!request) return
		this.requestIdToRequest.delete(event.requestId)
		this.updateIdlePromise()
	}
}
