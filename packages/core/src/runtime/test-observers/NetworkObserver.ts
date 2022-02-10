import NetworkRecorder from '../../network/Recorder'
import { RawResponse } from '../../network/Protocol'
import { IReporter } from '@flood/element-report'
import { ConsoleMethod } from '../Settings'
import debugImport from 'debug'

const debug = debugImport('element:runtime:observer')

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
		private consoleFilters: ConsoleMethod[]
	) {}

	public async attachToNetworkRecorder(): Promise<void> {
		if (this.attached) return
		debug('attachToNetworkRecorder()')
		this.attached = true
		this.failedRequests = []
		this.requests = new Set()
		await this.attachPageEvents()
	}

	private async attachPageEvents(): Promise<void> {
		await this.networkRecorder.attachEvent('frameattached', (event) => this.onFrameAttached(event))
		await this.networkRecorder.attachEvent('domcontentloaded', (event) =>
			this.onDOMContentLoaded(event)
		)

		await this.networkRecorder.attachEvent('framenavigated', (event) => this.onNavigate(event))
		await this.networkRecorder.attachEvent('Page.frameStartedLoading', (event) =>
			this.onFrameStartedLoading(event)
		)
		await this.networkRecorder.attachEvent('Page.frameStoppedLoading', (event) =>
			this.onFrameStoppedLoading(event)
		)
		await this.networkRecorder.attachEvent('Page.frameClearedScheduledNavigation', (event) =>
			this.onFrameClearedScheduledNavigation(event)
		)

		await this.networkRecorder.attachEvent('Network.requestWillBeSent', (event) =>
			this.onRawNetworkRequestWillBeSent(event)
		)
		await this.networkRecorder.attachEvent('Network.responseReceived', (event) =>
			this.onRawNetworkResponse(event)
		)
		await this.networkRecorder.attachEvent('Network.loadingFinished', (event) =>
			this.onRawNetworkLoadingFinished(event)
		)
		await this.networkRecorder.attachEvent('Network.loadingFailed', (event) =>
			this.onRawNetworkLoadingFailed(event)
		)

		await this.networkRecorder.attachEvent('console', (msg) => {
			const msgType = msg.type() === 'warning' ? 'warn' : msg.type()
			if (this.consoleFilters.length === 0 || !this.consoleFilters.includes(msgType)) {
				this.reporter.testScriptConsole(msg.type(), msg.text())
			}
		})
	}

	private onRawNetworkRequestWillBeSent(payload: Event): void {
		debug('onRawNetworkRequestWillBeSent', payload.requestId)
		this.requests.add(payload.requestId)
		this.networkRecorder.addPendingTask(this.networkRecorder.recordRequest(payload))
	}

	private onRawNetworkResponse(payload: RawResponse): void {
		debug('onRawNetworkResponse', payload.requestId)
		if (this.requests.has(payload.requestId))
			this.networkRecorder.addPendingTask(this.networkRecorder.recordResponse(payload))
	}

	private onRawNetworkLoadingFinished({
		requestId,
		encodedDataLength,
		timestamp,
	}: RequestEvent): void {
		debug('onRawNetworkLoadingFinished', requestId)
		if (!this.requests.has(requestId)) {
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
					() => yeah(true),
					(err) => nah(err)
				)
		})
		this.networkRecorder.addPendingTask(promise)
	}

	private async onRawNetworkLoadingFailed(event: Event): Promise<void> {
		const { requestId } = event
		debug('onRawNetworkLoadingFailed', requestId)
		this.removePendingRequest(requestId)
		this.failedRequests.push(requestId)
	}

	private removePendingRequest(requestId: string): void {
		this.requests.delete(requestId)
	}

	private onFrameAttached(event: any): void {}
	private onDOMContentLoaded(event: any): void {
		this.networkRecorder.recordDOMContentLoadedEvent()
	}

	private onNavigate(event: any): void {}
	private onFrameStartedLoading(event: any): void {}
	private onFrameClearedScheduledNavigation(event: any) {}
	private onFrameStoppedLoading(event: any) {}
}
