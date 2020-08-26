import { ElementCondition, NullableLocatable } from '../Condition'
import { EvaluateFn } from 'puppeteer'

export class ElementSelectedCondition extends ElementCondition {
	constructor(desc: string, locator: NullableLocatable, ...args: any[]) {
		super(desc, locator)
		this.pageFuncArgs = args
	}

	toString() {
		return 'waiting element to be selected'
	}

	pageFunc: EvaluateFn = (node: HTMLElement, waitForSelected: boolean) => {
		if (!node) return false
		function isSelectable(node: HTMLElement) {
			const tagName = node.tagName

			if (tagName === 'OPTION') {
				return true
			}

			if (tagName === 'INPUT') {
				const type = node.getAttribute('type')
				return type === 'checkbox' || type === 'radio'
			}

			return false
		}

		if (!isSelectable(node)) return false

		let propertyName = 'selected'
		const type = node.getAttribute('type')
		if ('checkbox' === type || 'radio' === type) {
			propertyName = 'checked'
		}

		const value = !!(node as any)[propertyName]
		return value === waitForSelected
	}

	async waitForEvent(): Promise<any> {
		return
	}
}
