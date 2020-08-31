import { ElementCondition, NullableLocatable } from '../Condition'
import { EvaluateFn } from 'puppeteer'

export class ElementTextNotMatchCondition extends ElementCondition {
	constructor(desc: string, locator: NullableLocatable, ...args: any[]) {
		super(desc, locator)
		this.pageFuncArgs = args
	}

	toString() {
		return `waiting for element text to not equal "${this.pageFuncArgs[0]}"`
	}

	pageFunc: EvaluateFn = (node: HTMLElement, expectedText: string, partial: boolean = false) => {
		if (!node) return false
		if (!node.textContent) return false
		const text = node.textContent.trim()

		if (typeof expectedText === 'string') {
			if (expectedText.startsWith('/') && expectedText.endsWith('/')) {
				// RegExp
				const exp = new RegExp(expectedText.slice(1, expectedText.length - 1))
				return !exp.test(text)
			} else if (partial) {
				return text.indexOf(expectedText) === -1
			} else {
				return text !== expectedText
			}
		}
		return false
	}

	async waitForEvent(): Promise<any> {
		return
	}
}
