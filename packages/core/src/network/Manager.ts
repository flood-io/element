import { ChromiumBrowserContext, Page } from 'playwright'
import debugFactory from 'debug'
const debug = debugFactory('element:network:recorder')

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
	private lifecycleCompleteCallback: ((value: unknown) => void) | null
	private networkIdlePromise: Promise<any> | null
	public timeout = 10e3

	constructor(private page: Page, private requestIdToRequest = new Map<string, any>()) {}

	public async getIdlePromise(): Promise<void> {
		console.log('get idle promise')
		this.createIdlePromise()

		return this.networkIdlePromise
	}

	public get pendingRequestCount(): number {
		return this.requestIdToRequest.size
	}

	private updateIdlePromise(): void {
		if (this.pendingRequestCount <= 2 && this.lifecycleCompleteCallback) {
			this.lifecycleCompleteCallback.apply(this)
			this.networkIdlePromise = null
			this.lifecycleCompleteCallback = null
			console.log(`Idle promise callback fired`)
		}
	}

	private createTimeoutPromise(): Promise<NodeJS.Timeout> {
		return new Promise((fulfill) => setTimeout(fulfill, this.timeout))
	}

	private createIdlePromise(): void {
		if (this.lifecycleCompleteCallback) return
		if (this.networkIdlePromise) return

		const lifecycleCompletePromise = new Promise((fulfill) => {
			this.lifecycleCompleteCallback = fulfill
		})

		this.networkIdlePromise = Promise.race([lifecycleCompletePromise, this.createTimeoutPromise()])
		this.updateIdlePromise()
	}

	public async attachEvents(): Promise<void> {
		try {
			const browserContext = (await this.page.context()) as ChromiumBrowserContext
			const client = await browserContext.newCDPSession(this.page)
			if (client) {
				await client.send('Network.enable')
				client.on('Network.requestWillBeSent', this.onRequestWillBeSent.bind(this))
				client.on('Network.requestIntercepted', this.onRequestIntercepted.bind(this))
				client.on('Network.responseReceived', this.onResponseReceived.bind(this))
				client.on('Network.loadingFinished', this.onLoadingFinished.bind(this))
				client.on('Network.loadingFailed', this.onLoadingFailed.bind(this))
			}
		} catch (err) {
			debug(err)
		}
	}

	private onRequestWillBeSent(event: Event): void {
		this.handleRequestStart(
			event.requestId,
			event.request.url,
			event.type,
			event.request,
			event.frameId
		)
	}

	private handleRequestStart(
		requestId: string,
		_url: string,
		_resourceType: string,
		_requestPayload: any,
		_frameId: string
	): void {
		if (requestId) this.requestIdToRequest.set(requestId, null)
	}

	private onRequestIntercepted(): void {
		console.log('RequestIntercepted')
		this.updateIdlePromise()
	}

	private onResponseReceived(): void {
		this.updateIdlePromise()
	}

	private onLoadingFinished(event: any): void {
		// const request = this.requestIdToRequest.get(event.requestId)
		this.requestIdToRequest.delete(event.requestId)
		this.updateIdlePromise()
		// console.log(`Pending requests: ${this.pendingRequestCount}`)
	}

	private onLoadingFailed(event: RequestEvent): void {
		const request = this.requestIdToRequest.get(event.requestId)
		// For certain requestIds we never receive requestWillBeSent event.
		// @see https://crbug.com/750469
		if (!request) return
		this.requestIdToRequest.delete(event.requestId)
		this.updateIdlePromise()
	}
}
