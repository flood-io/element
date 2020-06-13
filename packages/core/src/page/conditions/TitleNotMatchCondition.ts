import { Condition } from '../Condition'
import { Frame } from 'playwright'

export class TitleNotMatchCondition extends Condition {
	constructor(desc: string, public expectedTitle: string, public partial: boolean = false) {
		super(desc)
	}

	toString() {
		return `page title to equal '${this.expectedTitle}'`
	}

	public async waitFor(frame: Frame): Promise<boolean> {
		await frame.waitForFunction(
			(title: string) => {
				if (typeof title === 'string') {
					if (title.startsWith('/') && title.endsWith('/')) {
						// RegExp
						const exp = new RegExp(title.slice(1, title.length - 1))
						return !exp.test(document.title)
					} else if (this.partial) {
						return document.title.indexOf(title) === -1
					} else {
						return document.title.trim() !== title.trim()
					}
				}
			},
			this.expectedTitle,
			{ timeout: 30e3 },
		)
		return true
	}

	public async waitForEvent(): Promise<any> {
		return
	}
}
