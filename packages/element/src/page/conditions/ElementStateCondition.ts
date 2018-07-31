import { ElementCondition } from '../Condition'
import { EvaluateFn } from 'puppeteer'
import { NullableLocatable } from '../../../index'

export class ElementStateCondition extends ElementCondition {
	constructor(desc: string, locator: NullableLocatable, ...args: any[]) {
		super(desc, locator)
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
