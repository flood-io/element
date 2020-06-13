import { LocatorBuilder, EvaluateFn } from '../types'

export class VisibleTextLocator implements LocatorBuilder {
	constructor(public linkText: string, public partial: boolean = false) {}

	get pageFuncArgs(): any[] {
		return [this.linkText, this.partial]
	}

	get pageFunc(): EvaluateFn {
		return (targetText: string, partial = true) => {
			// TODO: Switch expressions if not partial
			const expression = `//*[contains(text(), ${JSON.stringify(targetText)})]`
			const iterator = document.evaluate(
				expression,
				document,
				null,
				XPathResult.ORDERED_NODE_ITERATOR_TYPE,
				null,
			)

			let node = iterator.iterateNext()
			function hasVisibleBoundingBox(element: HTMLElement) {
				const rect = element.getBoundingClientRect()
				return !!(rect.top || rect.bottom || rect.width || rect.height)
			}

			while (node) {
				if (node && node.nodeType === Node.ELEMENT_NODE) {
					const element: HTMLElement = node as HTMLElement
					const style = window.getComputedStyle(element)
					const isVisible = style && style.visibility !== 'hidden' && hasVisibleBoundingBox(element)

					if (isVisible) return node
				}
				node = iterator.iterateNext()
			}

			return null
		}
	}

	// TODO: Switch this to use Xpath
	get pageFuncMany(): EvaluateFn {
		return (targetText: string, partial: boolean) => {
			const elements = Array.from(document.querySelectorAll('*'))
			function hasVisibleBoundingBox(node: Element) {
				const rect = node.getBoundingClientRect()
				return !!(rect.top || rect.bottom || rect.width || rect.height)
			}
			return elements
				.filter(link => {
					if (!link.textContent) return false
					const text = link.textContent.trim()
					return (partial && text.indexOf(targetText) !== -1) || text === targetText
				})
				.filter(node => {
					const style = window.getComputedStyle(node)
					const isVisible = style && style.visibility !== 'hidden' && hasVisibleBoundingBox(node)
					return isVisible
				})
		}
	}

	toString() {
		return `By.partialVisibleText("${this.linkText}")`
	}
}
