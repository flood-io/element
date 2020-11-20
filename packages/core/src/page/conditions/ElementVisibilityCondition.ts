import { ElementCondition, NullableLocatable } from '../Condition'
import { EvaluateFn } from 'puppeteer'

export class ElementVisibilityCondition extends ElementCondition {
	constructor(desc: string, locator: NullableLocatable, ...args: any[]) {
		super(desc, locator)
		this.pageFuncArgs = args
	}

	toString() {
		return 'waiting for element to be visible on the page'
	}

	pageFunc: EvaluateFn = (node: HTMLElement, waitForVisible: boolean, waitForHidden: boolean) => {
		if (!node) return false

		function hasVisibleBoundingBox() {
			const rect = node.getBoundingClientRect()
			return !!(rect.top || rect.bottom || rect.width || rect.height)
		}

		const style = window.getComputedStyle(node)
		const isVisible = style && style.visibility !== 'hidden' && hasVisibleBoundingBox()
		return waitForVisible === isVisible || waitForHidden === !isVisible
	}

	async waitForEvent(): Promise<any> {
		return
	}
}

export class ElementLocatedCondition extends ElementCondition {
	constructor(desc: string, locator: NullableLocatable, ...args: any[]) {
		super(desc, locator)
		this.pageFuncArgs = args
	}

	toString() {
		return 'waiting for element to be located on the page'
	}

	pageFunc: EvaluateFn = (node: HTMLElement, isPresent = true) => {
		return !!node === isPresent
	}

	async waitForEvent(): Promise<any> {
		return
	}
}

export class ElementsLocatedCondition extends ElementCondition {
	constructor(public desc: string, locator: NullableLocatable, ...args: any[]) {
		super(desc, locator)

		this.pageFuncArgs = args
	}

	toString() {
		const [count] = this.pageFuncArgs
		return `waiting for ${count} elements to be located on the page`
	}

	get locatorPageFunc() {
		return this.locator.pageFuncMany
	}

	pageFunc: EvaluateFn = (nodes: HTMLElement[], count = 1) => {
		if (typeof nodes === 'undefined') return false
		return nodes.length >= count
	}
	async waitForEvent(): Promise<any> {
		return
	}
}
