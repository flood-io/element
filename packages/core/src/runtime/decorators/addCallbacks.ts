import { AnyErrorData, interpretError } from '../errors/Types'
// import interpretPuppeteerError from '../errors/interpretPuppeteerError'
import { StructuredError } from '../../utils/StructuredError'
import { Browser } from '../../interface/IBrowser'
import { StepActionArgs } from '../../utils/StepActionArgs'

/**
 * Defines a Function Decorator which wraps a method with class local before and after
 */
export function addCallbacks() {
	const errorInterpreters = []
	return function(_target: Browser, propertyKey: string, descriptor: PropertyDescriptor) {
		const originalFn = descriptor.value
		descriptor.value = async function(...args: any[]) {
			let ret

			const browser = this as Browser

			// capture the stack trace at call-time
			const calltimeError = new Error()
			Error.captureStackTrace(calltimeError)
			const calltimeStack = calltimeError.stack
			try {
				if (browser.beforeFunc instanceof Function) await browser.beforeFunc(browser, propertyKey)
				ret = await originalFn.apply(browser, args)
			} catch (e) {
				const newError = interpretError<Browser, AnyErrorData>(
					errorInterpreters,
					e,
					browser,
					propertyKey,
					args,
				)
				const sErr = StructuredError.liftWithSource(newError, 'browser', `browser.${propertyKey}`)
				sErr.stack = calltimeStack
				throw sErr
			} finally {
				if (browser.afterFunc instanceof Function) {
					const arg = StepActionArgs(args)
					await browser.afterFunc(browser, propertyKey, arg)
				}
			}
			return ret
		}
		return descriptor
	}
}
