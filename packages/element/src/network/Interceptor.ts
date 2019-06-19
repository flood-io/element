import { Page, Request } from 'puppeteer'
import debugFactory from 'debug'
const debug = debugFactory('network:intercept')

export default class Interceptor {
	constructor(public blockedDomains: string[]) {}

	async attach(page: Page) {
		if (this.blockedDomains.length) {
			await page.setRequestInterception(true)
			page.on('request', this.requestBlocker)

			debug(
				`Attched network request interceptor with blocked domains: ${this.blockedDomains.join(
					', ',
				)}`,
			)
		}
	}

	async detach(page: Page) {
		page.off('request', this.requestBlocker)
		await page.setRequestInterception(false)
	}

	private requestBlocker = (interceptedRequest: Request) => {
		let url = new URL(interceptedRequest.url())

		if (this.blockedDomains.some(domain => url.hostname.includes(domain))) {
			debug(`Blocked request to "${url.hostname}"`)
			interceptedRequest.abort()
		} else {
			interceptedRequest.continue()
		}
	}
}
