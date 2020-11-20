import { LocatorBuilder, EvaluateFn } from '../types'

export class CSSLocator implements LocatorBuilder {
	constructor(public selector: string) {}

	get pageFuncArgs(): string[] {
		return [this.selector]
	}

	get pageFunc(): EvaluateFn<string | undefined> {
		return (selector: string, node?: HTMLElement) => {
			const elm = (node ?? document).querySelector(selector)
			if (elm) return elm
			const frames: HTMLFrameElement | null = (node ?? document).querySelector('frame')
			return frames?.contentDocument?.querySelector(selector)
		}
	}

	get pageFuncMany(): EvaluateFn<string> {
		return (selector: string, node?: HTMLElement) =>
			Array.from((node ?? document).querySelectorAll(selector))
	}

	toString() {
		return `css(${this.selector})`
	}
}
