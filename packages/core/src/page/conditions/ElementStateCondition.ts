import { ElementCondition, NullableLocatable } from '../Condition'
import { EvaluateFn } from 'puppeteer'

export class ElementStateCondition extends ElementCondition {
	constructor(desc: string, locator: NullableLocatable, ...args: any[]) {
		super(desc, locator)
		this.pageFuncArgs = args
	}

	toString() {
		const [disabled] = this.pageFuncArgs
		return `for element to become ${disabled ? 'disabled' : 'enabled'}`
	}

	pageFunc: EvaluateFn = (node: HTMLElement, waitForDisabled: boolean) => {
		if (!node) return false
		return (node as any)['disabled'] === waitForDisabled
	}

	async waitForEvent() {
		return
	}
}
