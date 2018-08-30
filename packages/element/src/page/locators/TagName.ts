import { BaseLocator } from '../Locator'
import { EvaluateFn } from 'puppeteer'

export class TagNameLocator extends BaseLocator {
	constructor(public tagName: string) {
		super(`<${tagName}>`)
	}

	get pageFuncArgs(): string[] {
		return [this.tagName]
	}

	get pageFunc(): EvaluateFn {
		return (tagName: string) => document.getElementsByTagName(tagName)[0]
	}

	get pageFuncMany(): EvaluateFn {
		return (tagName: string) => document.getElementsByTagName(tagName)
	}

	toString() {
		return `element with tagName "${this.tagName}"`
	}
}
