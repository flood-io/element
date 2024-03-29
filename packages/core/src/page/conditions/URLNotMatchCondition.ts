import { Condition } from '../Condition'
import { Frame } from 'playwright'

export class URLNotMatchCondition extends Condition {
	constructor(desc: string, public url: string, public partial: boolean = false) {
		super(desc)
	}

	toString() {
		return `waiting for URL to equal "${this.url}"`
	}

	public async waitFor(frame: Frame): Promise<boolean> {
		await frame.waitForFunction(
			(args: string) => {
				const [url, partial] = JSON.parse(args)
				if (typeof url === 'string') {
					if (url.startsWith('/') && url.endsWith('/')) {
						// RegExp
						const exp = new RegExp(url.slice(1, url.length - 1))
						return !exp.test(window.location.href)
					}

					const currentUrl = window.location.href.trim().toLowerCase()
					const expectedUrl = url.trim().toLowerCase()
					if (partial) {
						return currentUrl.indexOf(expectedUrl) === -1
					} else {
						return currentUrl !== expectedUrl
					}
				}
			},
			JSON.stringify([this.url, this.partial]),
			{ timeout: 30e3 }
		)
		return true
	}

	public async waitForEvent(): Promise<any> {
		return
	}
}
