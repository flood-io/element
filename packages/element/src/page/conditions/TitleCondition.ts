import { Condition } from '../Condition'
import { Frame } from 'puppeteer'

export class TitleCondition extends Condition {
	constructor(desc: string, public expectedTitle: string, public partial: boolean = false) {
		super(desc)
	}

	toString() {
		return `page title to equal '${this.expectedTitle}'`
	}

	public async waitFor(frame: Frame): Promise<boolean> {
		await frame.waitForFunction(
			(title: string, partial: boolean) => {
				if (typeof title === 'string') {
					if (title.startsWith('/') && title.endsWith('/')) {
						// RegExp
						let exp = new RegExp(title.slice(1, title.length - 1))
						return exp.test(document.title)
					} else if (partial) {
						return document.title.indexOf(title) > -1
					} else {
						return document.title.trim() === title.trim()
					}
				}
			},
			{ polling: 'mutation', timeout: 30e3 },
			this.expectedTitle,
			this.partial === true,
		)
		return true
	}
}
