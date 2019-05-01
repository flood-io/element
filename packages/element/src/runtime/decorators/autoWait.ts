import { Browser } from '../Browser'
import { Until } from '../../page/Until'
import { Locatable } from '../types'

const isLocatable = (arg: Locatable | any): arg is Locatable => {
	return !!arg.pageFunc || !!arg.find || !!arg.element || typeof arg === 'string'
}

/**
 * Applies a wait to the following finder by applying the same locatable
 */
export function autoWait<T>() {
	return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
		let originalFn = descriptor.value
		descriptor.value = async function(this: Browser<T>, ...args: any[]) {
			let locator = args.find(isLocatable)
			const { autoWait } = this.settings

			if (locator && autoWait) {
				await this.wait(Until.elementIsVisible(locator))
				return originalFn.apply(this, args)
			} else {
				return originalFn.apply(this, args)
			}
		}
		return descriptor
	}
}
