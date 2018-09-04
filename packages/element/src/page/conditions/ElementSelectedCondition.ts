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
		if (!isSelectable(node)) return false

		let tagName = node.tagName
		var propertyName = 'selected'
		var type = tagName.toUpperCase()
		if ('CHECKBOX' == type || 'RADIO' == type) {
			propertyName = 'checked'
		}

		let value = !!(node as any)[propertyName]
		return value === waitForSelected

		function isSelectable(node: HTMLElement) {
			let tagName = node.tagName

			if (tagName === 'OPTION') {
				return true
			}

			if (tagName === 'INPUT') {
				let type = tagName.toLowerCase()
				return type == 'checkbox' || type == 'radio'
			}

			return false
		}
	}
}
