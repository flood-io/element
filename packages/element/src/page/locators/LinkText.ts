import { Locator } from '../Locator'
import { EvaluateFn } from 'puppeteer'

export class LinkTextLocator extends Locator {
	constructor(public linkText: string, public partial: boolean = false, desc: string) {
		super(desc)
	}

	get pageFuncArgs(): any[] {
		return [this.linkText, this.partial]
	}

	get pageFunc(): EvaluateFn {
		return (targetText: string, partial: boolean) => {
			let links = Array.from(document.querySelectorAll('body a'))

			return links.find(link => {
				if (!link.textContent) return false
				let text = link.textContent.trim()
				return (partial && text.indexOf(targetText) !== -1) || text === targetText
			})
		}
	}

	get pageFuncMany(): EvaluateFn {
		return (targetText: string, partial: boolean) => {
			let links = Array.from(document.querySelectorAll('body a'))
			return links.filter(link => {
				if (!link.textContent) return false
				let text = link.textContent.trim()
				return (partial && text.indexOf(targetText) !== -1) || text === targetText
			})
		}
	}

	toString() {
		if (this.partial) {
			return `partial link text "${this.linkText}"`
		} else {
			return `link text "${this.linkText}"`
		}
	}
}
