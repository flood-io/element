// import { BaseLocator } from '../Locators'
import { EvaluateFn } from 'puppeteer'
import { LocatorBuilder } from '../types'

export class CSSLocator implements LocatorBuilder {
	constructor(public selector: string) {}

	get pageFuncArgs(): string[] {
		return [this.selector]
	}

	get pageFunc(): EvaluateFn<string | undefined> {
		return (selector: string, node?: HTMLElement) => (node ?? document).querySelector(selector)
	}

	get pageFuncMany(): EvaluateFn<string> {
		return (selector: string, node?: HTMLElement) =>
			Array.from((node ?? document).querySelectorAll(selector))
	}

	toString() {
		return `css(${this.selector})`
	}
}
