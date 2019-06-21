import { AnyErrorData, interpretError } from '../errors/Types'
import interpretPuppeteerError from '../errors/interpretPuppeteerError'
import { StructuredError } from '../../utils/StructuredError'
import { Browser, debug } from '../Browser'
/**
 * Defines a Function Decorator which wraps a method with class local before and after
 */
export function addCallbacks<T>() {
	const errorInterpreters = [interpretPuppeteerError]
	return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
		let originalFn = descriptor.value
		descriptor.value = async function(...args: any[]) {
			let ret
			const browser: Browser<T> = this
			// capture the stack trace at call-time
			const calltimeError = new Error()
			Error.captureStackTrace(calltimeError)
			const calltimeStack = calltimeError.stack
			try {
				if (browser.beforeFunc instanceof Function) await browser.beforeFunc(browser, propertyKey)
				ret = await originalFn.apply(browser, args)
				if (browser.afterFunc instanceof Function) await browser.afterFunc(browser, propertyKey)
			} catch (e) {
				debug('addCallbacks lifting to StructuredError', propertyKey, e)
				const newError = interpretError<Browser<T>, AnyErrorData>(
					errorInterpreters,
					e,
					this,
					propertyKey,
					args,
				)
				const sErr = StructuredError.liftWithSource(newError, 'browser', `browser.${propertyKey}`)
				sErr.stack = calltimeStack
				debug('error now', sErr)
				throw sErr
			}
			return ret
		}
		return descriptor
	}
}
