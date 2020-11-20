import { ElementCondition, NullableLocatable } from '../Condition'
import { EvaluateFn } from 'puppeteer'

export class ElementTextCondition extends ElementCondition {
	constructor(desc: string, locator: NullableLocatable, ...args: any[]) {
		super(desc, locator)
		this.pageFuncArgs = args
	}

	toString() {
		return `waiting for element text to equal "${this.pageFuncArgs[0]}"`
	}

	pageFunc: EvaluateFn = (node: HTMLElement, expectedText: string, partial = false) => {
		if (!node) return false
		if (!node.textContent) return false
		const text = node.textContent.trim()

		if (typeof expectedText === 'string') {
			if (expectedText.startsWith('/') && expectedText.endsWith('/')) {
				// RegExp
				const exp = new RegExp(expectedText.slice(1, expectedText.length - 1))
				return exp.test(text)
			} else {
				return (partial && text.indexOf(expectedText) !== -1) || text === expectedText
			}
		}
		return false
	}

	async waitForEvent(): Promise<any> {
		return
	}
}
