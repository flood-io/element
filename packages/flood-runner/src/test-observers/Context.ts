import { Test, NetworkRecorder, NetworkObserver, IReporter } from '@flood/element-api'
import { Page } from 'puppeteer'

export class Context {
	public networkRecorder: NetworkRecorder
	public observer: NetworkObserver

	private attached = false

	public attachTest(test: Test) {
		if (this.attached) return
		this.attached = true
		this.attachToPage(test.reporter, test.client.page)
	}

	// TODO deliberately detach from network recorder & observer

	public attachToPage(reporter: IReporter, page: Page) {
		this.networkRecorder = new NetworkRecorder(page)
		this.observer = new NetworkObserver(reporter, this.networkRecorder)
    this.observer.attachToNetworkRecorder()
	}

	public async syncNetworkRecorder() {
		await this.networkRecorder.sync()
	}
}
