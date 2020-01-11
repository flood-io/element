import { AnyErrorData, interpretError } from '../errors/Types'
import interpretPuppeteerError from '../errors/interpretPuppeteerError'
import { StructuredError } from '../../utils/StructuredError'
import { Browser } from '../types'

export function rewriteError() {
	const errorInterpreters = [interpretPuppeteerError]
	return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
		const originalFn = descriptor.value
		descriptor.value = async function(...args: any[]) {
			let ret
			const browser = this as Browser

			// capture the stack trace at call-time
			const calltimeError = new Error()
			Error.captureStackTrace(calltimeError)
			const calltimeStack = calltimeError.stack
			try {
				ret = await originalFn.apply(browser, args)
			} catch (e) {
				const newError = interpretError<Browser, AnyErrorData>(
					errorInterpreters,
					e,
					this,
					propertyKey,
					args,
				)
				const sErr = StructuredError.liftWithSource(newError, 'browser', `browser.${propertyKey}`)
				sErr.stack = calltimeStack
				throw sErr
			}
			return ret
		}
		return descriptor
	}
}
