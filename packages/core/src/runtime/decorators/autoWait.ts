import { Locatable } from '../Locatable'
import { Until } from '../../page/Until'

const isLocatable = (arg: Locatable | any): arg is Locatable => {
	return !!arg.pageFunc || !!arg.find || !!arg.element || typeof arg === 'string'
}

/**
 * Applies a wait to the following finder by applying the same locatable
 */
export function autoWaitUntil<T>() {
	return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
		const originalFn = descriptor.value
		descriptor.value = async function (...args: any[]) {
			const locator = args.find(isLocatable)
			const { waitUntil } = this.settings

			if (locator && waitUntil) {
				if (waitUntil === 'visible') {
					await this.waitWithoutDecorator(Until.elementIsVisible(locator))
				} else if (waitUntil === 'present') {
					await this.waitWithoutDecorator(Until.elementLocated(locator))
				} else if (waitUntil === 'ready') {
					await this.waitWithoutDecorator(Until.elementIsVisible(locator))
					await this.waitWithoutDecorator(Until.elementIsEnabled(locator))
				}
				return originalFn.apply(this, args)
			} else {
				return originalFn.apply(this, args)
			}
		}
		return descriptor
	}
}
