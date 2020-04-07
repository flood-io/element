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
				const type = tagName.toLowerCase()
				return type == 'checkbox' || type == 'radio'
			}

			return false
		}

		if (!isSelectable(node)) return false

		const tagName = node.tagName
		let propertyName = 'selected'
		const type = tagName.toUpperCase()
		if ('CHECKBOX' == type || 'RADIO' == type) {
			propertyName = 'checked'
		}

		const value = !!(node as any)[propertyName]
		return value === waitForSelected
	}

	async waitForEvent(): Promise<any> {
		return
	}
}
