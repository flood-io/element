import { BaseLocator } from '../Locators'
import { EvaluateFn } from 'puppeteer'

export class XPathLocator extends BaseLocator {
	constructor(public selector: string) {
		super(`xpath==${selector}`)
	}

	get pageFuncArgs(): string[] {
		return [this.selector]
	}

	get pageFunc(): EvaluateFn {
		return (expression: string) =>
			document.evaluate(expression, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
				.singleNodeValue
	}

	get pageFuncMany(): EvaluateFn {
		return (expression: string) => {
			let nodes = document.evaluate(
				expression,
				document,
				null,
				XPathResult.ORDERED_NODE_ITERATOR_TYPE,
				null,
			)

			let elements: Node[] = []
			let node = nodes.iterateNext()
			while (node) {
				elements.push(node)
				node = nodes.iterateNext()
			}

			return elements
		}
	}
}
