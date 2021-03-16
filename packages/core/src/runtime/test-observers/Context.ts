import { IReporter } from '@flood/element-report'
import { Test } from './testTypes'
import NetworkRecorder from '../../network/Recorder'
import NetworkObserver from './NetworkObserver'
import { Page } from 'playwright'
import { ConsoleMethod } from '../Settings'

export class Context {
	public networkRecorder: NetworkRecorder
	public observer: NetworkObserver

	private attached = false

	public async attachTest(test: Test): Promise<void> {
		if (this.attached) return
		this.attached = true
		await this.attachToPage(
			test.reporter,
			test.client.page,
			test.settings.consoleFilter as ConsoleMethod[],
		)
	}

	// TODO deliberately detach from network recorder & observer

	public async attachToPage(reporter: IReporter, page: Page, consoleFilters: ConsoleMethod[]): Promise<void> {
		this.networkRecorder = new NetworkRecorder(page)
		await this.networkRecorder.attachEvents()
		this.observer = new NetworkObserver(reporter, this.networkRecorder, consoleFilters)
		await this.observer.attachToNetworkRecorder()
	}

	public async syncNetworkRecorder(): Promise<void> {
		await this.networkRecorder.sync()
	}
}
