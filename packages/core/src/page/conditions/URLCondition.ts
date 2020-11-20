import { Condition } from '../Condition'
import { Frame } from 'puppeteer'

export class URLCondition extends Condition {
	constructor(desc: string, public url: string, public partial: boolean = false) {
		super(desc)
	}

	toString() {
		return `waiting for URL to equal "${this.url}"`
	}

	public async waitFor(frame: Frame): Promise<boolean> {
		await frame.waitForFunction(
			(url: string, partial: boolean) => {
				if (typeof url === 'string') {
					if (url.startsWith('/') && url.endsWith('/')) {
						// RegExp
						const exp = new RegExp(url.slice(1, url.length - 1))
						return exp.test(window.location.href)
					} else if (partial) {
						return window.location.href.toLowerCase().indexOf(url.toLowerCase()) > -1
					} else {
						return window.location.href.trim().toLowerCase() === url.trim().toLowerCase()
					}
				}
			},
			{ polling: 'raf', timeout: 30e3 },
			this.url,
			this.partial === true,
		)
		return true
	}

	public async waitForEvent(): Promise<any> {
		return
	}
}
