import { ElementCondition } from '../Condition'
import { EvaluateFn } from 'puppeteer'
import { Locatable } from '../Locator'

export class ElementStateCondition extends ElementCondition {
	constructor(locator: Locatable, ...args: any[]) {
		super(locator)
		this.pageFuncArgs = args
	}

	toString() {
		let [disabled] = this.pageFuncArgs
		return `for element to become ${disabled ? 'disabled' : 'enabled'}`
	}

	pageFunc: EvaluateFn = (node: HTMLElement, waitForDisabled: boolean) => {
		if (!node) return false
		return node['disabled'] === waitForDisabled
	}
}
