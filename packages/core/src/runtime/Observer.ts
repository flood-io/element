import NetworkRecorder from '../network/Recorder'
import { RawResponse } from '../network/Protocol'
import { ConsoleMethod } from './Settings'
import { IReporter } from '../Reporter'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const debug = require('debug')('element:runtime:observer')

interface Event {
	requestId: string
}

interface RequestEvent extends Event {
	timestamp: number
	encodedDataLength: number
}

export default class Observer {
	private failedRequests: string[]
	private requests: Set<string> = new Set()
	private attached = false

	constructor(
		private reporter: IReporter,
		public networkRecorder: NetworkRecorder,
		private consoleFilters: ConsoleMethod[],
	) {}

	public attachToNetworkRecorder(): void {
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

		this.networkRecorder.attachEvent('framenavigated', event => this.onNavigate(event))
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
			const msgType = msg.type() === 'warning' ? 'warn' : msg.type()
			if (this.consoleFilters.length === 0 || !this.consoleFilters.includes(msgType)) {
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

		if (!this.requests.has(requestId)) {
			console.error(`Unknown request: ${requestId}`)
			return
		}

		this.removePendingRequest(requestId)

		const promise = new Promise((yeah, nah) => {
			this.networkRecorder
				.recordResponseCompleted({
					requestId,
					encodedDataLength,
					timestamp,
				})
				.then(
					() => yeah(),
					err => nah(err),
				)
		})
		this.networkRecorder.addPendingTask(promise)
	}

	private async onRawNetworkLoadingFailed(event: Event) {
		const { requestId /*, errorText*/ } = event
		debug('onRawNetworkLoadingFailed', requestId)
		this.removePendingRequest(requestId)
		this.failedRequests.push(requestId)
	}

	private removePendingRequest(requestId: string) {
		debug(`removePendingRequest ${requestId}`)
	}

	private onFrameAttached(event: any): void {
		debug(`onFrameAttached ${event}`)
	}
	private onDOMContentLoaded(event: any): void {
		debug(`onDOMContentLoaded ${event}`)
		this.networkRecorder.recordDOMContentLoadedEvent()
	}

	private onNavigate(event: any): void {
		debug(`Frame scheduled navigation ${event}`)
	}

	private onFrameStartedLoading(event: any): void {
		debug(`onFrameStartedLoading ${event}`)
	}

	private onFrameClearedScheduledNavigation(event: any) {
		debug(`onFrameClearedScheduledNavigation ${event}`)
	}
	private onFrameStoppedLoading(event: any) {
		debug(`onFrameStoppedLoading ${event}`)
	}
}
