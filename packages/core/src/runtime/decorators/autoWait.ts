import { Browser } from '../types'
import { Until } from '../../page/Until'
import { Locatable } from '../types'

const isLocatable = (arg: Locatable | any): arg is Locatable => {
	return !!arg.pageFunc || !!arg.find || !!arg.element || typeof arg === 'string'
}

/**
 * Applies a wait to the following finder by applying the same locatable
 */
export function autoWaitUntil<T>() {
	return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
		let originalFn = descriptor.value
		descriptor.value = async function(this: Browser, ...args: any[]) {
			let locator = args.find(isLocatable)
			const { waitUntil } = this.settings

			if (locator && waitUntil) {
				if (waitUntil === 'visible') {
					await this.wait(Until.elementIsVisible(locator))
				} else if (waitUntil === 'present') {
					await this.wait(Until.elementLocated(locator))
				}
				return originalFn.apply(this, args)
			} else {
				return originalFn.apply(this, args)
			}
		}
		return descriptor
	}
}
