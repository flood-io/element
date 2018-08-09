import NetworkRecorder from '../network/Recorder'
import { ConsoleMethod } from '../runtime/Settings'
import { IReporter } from './../Reporter'

// import * as debugFactory from 'debug'
// const debug = debugFactory('element:observer')

export default class Observer {
	public consoleFilters: ConsoleMethod[]

	private failedRequests: string[]
	private requests: Set<string> = new Set()

	constructor(private reporter: IReporter, public networkRecorder: NetworkRecorder) {}

	public attach() {
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

	private onRawNetworkRequestWillBeSent(payload) {
		this.requests.add(payload.requestId)
		this.networkRecorder.addPendingTask(this.networkRecorder.recordRequest(payload))
	}

	private onRawNetworkResponse(payload) {
		if (this.requests.has(payload.requestId))
			this.networkRecorder.addPendingTask(this.networkRecorder.recordResponse(payload))
	}

	private onRawNetworkLoadingFinished({ requestId, encodedDataLength, timestamp }) {
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

	private async onRawNetworkLoadingFailed(event) {
		let { requestId /*, errorText*/ } = event
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

	private onFrameAttached(event): void {}
	private onDOMContentLoaded(event): void {
		this.networkRecorder.recordDOMContentLoadedEvent()
	}

	private onNavigate(event): void {
		// this.logger.debug(`Frame scheduled navigation ${event}`)
	}

	private onFrameStartedLoading(event): void {
		// this.pendingFrameTransition = this.env.waitForNavigation({
		// 	waitUntil: 'load',
		// })
		// this.logger.debug(`Page: Frame started loading id:${event.frameId}`)
	}

	private onFrameClearedScheduledNavigation(event) {
		// this.logger.debug(`Cancel frame navigation: id:${event.frameId}`)
	}
	private onFrameStoppedLoading(event) {
		// this.logger.debug(`Page: Frame stoppped loading id:${event.frameId}`)
	}
}
