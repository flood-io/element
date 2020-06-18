import { Page, Request } from 'playwright'
import debugFactory from 'debug'
const debug = debugFactory('network:intercept')
import { isMatch } from 'micromatch'

export default class Interceptor {
	constructor(public blockedDomains: string[]) {}
	private enableInterceptor = false

	async attach(page: Page) {
		if (this.blockedDomains.length) {
			/**
			 * NOTES
			 * this function does not supported on playwright
			 */
			this.enableInterceptor = true
			page.on('request', request => this.requestBlocker(page, request))

			debug(
				`Attched network request interceptor with blocked domains: "${this.blockedDomains.join(
					',',
				)}"`,
			)
		}
	}

	async detach(page: Page) {
		/**
		 * NOTES
		 * this function does not supported on playwright
		 */
		this.enableInterceptor = false
		page.off('request', request => this.requestBlocker(page, request))
	}

	private requestBlocker = (page: Page, interceptedRequest: Request) => {
		const url = new URL(interceptedRequest.url())

		debug(`Blocked request to "${url.host}"`)
		for (const domain of this.blockedDomains) {
			const matchee = domain.includes(':') ? url.host : url.hostname
			if (isMatch(matchee, domain) && this.enableInterceptor) {
				const regex = new RegExp(domain.replace(/\*/g, ''), 'g')
				page.route(regex, route => {
					return route.abort()
				})
			} else {
				page.route(domain, route => {
					return route.continue()
				})
			}
		}
	}
}
