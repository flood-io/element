import { Locator } from '../Locator'
import { EvaluateFn } from 'puppeteer'

export class CSSLocator extends Locator {
	constructor(public selector: string) {
		super()
	}

	get pageFuncArgs(): string[] {
		return [this.selector]
	}

	get pageFunc(): EvaluateFn {
		return (selector: string, node?: HTMLElement) =>
			(node ? node : document).querySelector(selector)
	}

	get pageFuncMany(): EvaluateFn {
		return (selector: string, node?: HTMLElement) =>
			Array.from((node ? node : document).querySelectorAll(selector))
	}

	toString() {
		return `css(${this.selector})`
	}
}
