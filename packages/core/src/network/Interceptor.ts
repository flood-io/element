import { Page, Request } from 'playwright'
import debugFactory from 'debug'
const debug = debugFactory('network:intercept')
import { isMatch } from 'micromatch'

export default class Interceptor {
	constructor(public blockedDomains: string[]) {}

	async attach(page: Page) {
		if (this.blockedDomains.length) {
			// await page.setRequestInterception(true)
			page.on('request', this.requestBlocker)

			debug(
				`Attched network request interceptor with blocked domains: "${this.blockedDomains.join(
					',',
				)}"`,
			)
		}
	}

	async detach(page: Page) {
		page.off('request', this.requestBlocker)
		// await page.setRequestInterception(false)
	}

	private requestBlocker = (interceptedRequest: Request) => {
		const url = new URL(interceptedRequest.url())

		if (
			this.blockedDomains.some(domain => {
				const matchee = domain.includes(':') ? url.host : url.hostname
				return isMatch(matchee, domain)
			})
		) {
			debug(`Blocked request to "${url.host}"`)
			// interceptedRequest.abort()
		} else {
			debug(`Accepted request to "${url.host}"`)
			// interceptedRequest.continue()
		}
	}
}
