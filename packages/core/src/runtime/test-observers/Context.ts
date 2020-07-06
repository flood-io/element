import { IReporter } from '../../Reporter'
import Test from '../Test'
import NetworkRecorder from '../../network/Recorder'
import NetworkObserver from './NetworkObserver'
import { Page } from 'playwright'

export class Context {
	public networkRecorder: NetworkRecorder
	public observer: NetworkObserver

	private attached = false

	public async attachTest(test: Test) {
		if (this.attached) return
		this.attached = true
		await this.attachToPage(test.reporter, test.client.page)
	}

	// TODO deliberately detach from network recorder & observer

	public async attachToPage(reporter: IReporter, page: Page) {
		this.networkRecorder = new NetworkRecorder(page)
		await this.networkRecorder.attachEvents()
		this.observer = new NetworkObserver(reporter, this.networkRecorder)
		await this.observer.attachToNetworkRecorder()
	}

	public async syncNetworkRecorder() {
		await this.networkRecorder.sync()
	}
}
