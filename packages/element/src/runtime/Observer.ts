import NetworkRecorder from '../network/Recorder'
import { RawResponse } from '../network/Protocol'
import { ConsoleMethod } from '../runtime/Settings'
import { IReporter } from './../Reporter'

import * as debugFactory from 'debug'
const debug = debugFactory('element:runtime:observer')

interface Event {
	requestId: string
}

interface RequestEvent extends Event {
	timestamp: number
	encodedDataLength: number
}

export default class Observer {
	public consoleFilters: ConsoleMethod[]

	private failedRequests: string[]
	private requests: Set<string> = new Set()
	private attached = false

	constructor(private reporter: IReporter, public networkRecorder: NetworkRecorder) {}

	public attachToNetworkRecorder() {
		if (this.attached) return
		debug('attachToNetworkRecorder()')
		this.attached = true
		this.failedRequests = []
		this.requests = new Set()
		this.attachPageEvents()
	}

	private attachPageEvents() {
		this.networkRecorder.attachEvent('frameattached', event => this.onFrameAttached(event))
		this.networkRecorder.attachEvent('domcontentloaded', event => this.onDOMContentLoaded(event))

		this.networkRecorder.attachEvent('Page.frameScheduledNavigation', event =>
			this.onNavigate(event),
		)
		this.networkRecorder.attachEvent('Page.frameStartedLoading', event =>
			this.onFrameStartedLoading(event),
		)
		this.networkRecorder.attachEvent('Page.frameStoppedLoading', event =>
			this.onFrameStoppedLoading(event),
		)
		this.networkRecorder.attachEvent('Page.frameClearedScheduledNavigation', event =>
			this.onFrameClearedScheduledNavigation(event),
		)

		// this.networkRecorder.attachEvent('response', event => this.onNetworkResponse(event))
		this.networkRecorder.attachEvent('Network.requestWillBeSent', event =>
			this.onRawNetworkRequestWillBeSent(event),
		)
		this.networkRecorder.attachEvent('Network.responseReceived', event =>
			this.onRawNetworkResponse(event),
		)
		this.networkRecorder.attachEvent('Network.loadingFinished', event =>
			this.onRawNetworkLoadingFinished(event),
		)
		this.networkRecorder.attachEvent('Network.loadingFailed', event =>
			this.onRawNetworkLoadingFailed(event),
		)

		this.networkRecorder.attachEvent('console', msg => {
			if (this.consoleFilters.length == 0 || !this.consoleFilters.includes(msg.type())) {
				this.reporter.testScriptConsole(msg.type(), msg.text())
			}
		})
	}

	private onRawNetworkRequestWillBeSent(payload: Event) {
		debug('onRawNetworkRequestWillBeSent', payload.requestId)
		this.requests.add(payload.requestId)
		this.networkRecorder.addPendingTask(this.networkRecorder.recordRequest(payload))
	}

	private onRawNetworkResponse(payload: RawResponse) {
		debug('onRawNetworkResponse', payload.requestId)
		if (this.requests.has(payload.requestId))
			this.networkRecorder.addPendingTask(this.networkRecorder.recordResponse(payload))
	}

	private onRawNetworkLoadingFinished({ requestId, encodedDataLength, timestamp }: RequestEvent) {
		debug('onRawNetworkLoadingFinished', requestId)
		// console.log(`onRawNetworkLoadingFinished: ${requestId}`)
		if (!this.requests.has(requestId)) {
			console.error(`Unknown request: ${requestId}`)
			return
		}

		this.removePendingRequest(requestId)

		let promise = new Promise((yeah, nah) => {
			this.networkRecorder
				.recordResponseCompleted({
					requestId,
					encodedDataLength,
					timestamp,
				})
				.then(() => yeah(), err => nah(err))
		})
		this.networkRecorder.addPendingTask(promise)
	}

	private async onRawNetworkLoadingFailed(event: Event) {
		let { requestId /*, errorText*/ } = event
		debug('onRawNetworkLoadingFailed', requestId)
		this.removePendingRequest(requestId)
		this.failedRequests.push(requestId)

		// console.log(`Network.loadingFailed ${requestId} - ${errorText}`)
	}

	// private onNetworkResponse(response: Response) {
	// 	// console.log(response.url)
	// }

	private removePendingRequest(requestId: string) {
		this.requests.delete(requestId)
		// console.log(`Pending requests: ${this.requests.size}`)
	}

	private onFrameAttached(event: any): void {}
	private onDOMContentLoaded(event: any): void {
		this.networkRecorder.recordDOMContentLoadedEvent()
	}

	private onNavigate(event: any): void {
		// this.logger.debug(`Frame scheduled navigation ${event}`)
	}

	private onFrameStartedLoading(event: any): void {
		// this.pendingFrameTransition = this.env.waitForNavigation({
		// 	waitUntil: 'load',
		// })
		// this.logger.debug(`Page: Frame started loading id:${event.frameId}`)
	}

	private onFrameClearedScheduledNavigation(event: any) {
		// this.logger.debug(`Cancel frame navigation: id:${event.frameId}`)
	}
	private onFrameStoppedLoading(event: any) {
		// this.logger.debug(`Page: Frame stoppped loading id:${event.frameId}`)
	}
}
