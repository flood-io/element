import { LocatorBuilder, EvaluateFn } from '../types'

export class XPathLocator implements LocatorBuilder {
	constructor(public selector: string) {}

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
			const nodes = document.evaluate(
				expression,
				document,
				null,
				XPathResult.ORDERED_NODE_ITERATOR_TYPE,
				null,
			)

			const elements: Node[] = []
			let node = nodes.iterateNext()
			while (node) {
				elements.push(node)
				node = nodes.iterateNext()
			}

			return elements
		}
	}

	toString() {
		return `xpath==${this.selector}`
	}
}
