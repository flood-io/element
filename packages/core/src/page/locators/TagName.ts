import { EvaluateFn } from 'puppeteer'
import { LocatorBuilder } from '../types'

export class TagNameLocator implements LocatorBuilder {
	constructor(public tagName: string) {}

	get pageFuncArgs(): string[] {
		return [this.tagName]
	}

	get pageFunc(): EvaluateFn {
		return (tagName: string, node?: HTMLElement) =>
			(node ?? document).getElementsByTagName(tagName)[0]
	}

	get pageFuncMany(): EvaluateFn {
		return (tagName: string, node?: HTMLElement) => (node ?? document).getElementsByTagName(tagName)
	}

	toString() {
		return `element with tagName "${this.tagName}"`
	}
}
