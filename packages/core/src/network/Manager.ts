import { Page } from 'puppeteer'

export class Manager {
	private lifecycleCompleteCallback: (() => void) | null
	private networkIdlePromise: Promise<any> | null
	private maximumTimer: any
	public timeout = 10e3

	constructor(private page: Page, private requestIdToRequest = new Map<string, any>()) {
		this.attachEvents()
	}

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
		return new Promise(fulfill => (this.maximumTimer = setTimeout(fulfill, this.timeout)))
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

	private attachEvents() {
		this.page['_client'].on('Network.requestWillBeSent', this.onRequestWillBeSent.bind(this))
		this.page['_client'].on('Network.requestIntercepted', this.onRequestIntercepted.bind(this))
		this.page['_client'].on('Network.responseReceived', this.onResponseReceived.bind(this))
		this.page['_client'].on('Network.loadingFinished', this.onLoadingFinished.bind(this))
		this.page['_client'].on('Network.loadingFailed', this.onLoadingFailed.bind(this))
	}

	private onRequestWillBeSent(event) {
		if (event.redirectResponse) {
		}

		this.handleRequestStart(
			event.requestId,
			event.request.url,
			event.type,
			event.request,
			event.frameId,
		)
	}

	private handleRequestStart(requestId, url, resourceType, requestPayload, frameId) {
		if (requestId) this.requestIdToRequest.set(requestId, null)
	}

	private onRequestIntercepted() {
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

	private onLoadingFailed(event) {
		const request = this.requestIdToRequest.get(event.requestId)
		// For certain requestIds we never receive requestWillBeSent event.
		// @see https://crbug.com/750469
		if (!request) return
		this.requestIdToRequest.delete(event.requestId)
		this.updateIdlePromise()
	}
}
