import { AnyErrorData, interpretError } from '../errors/Types'
import interpretPuppeteerError from '../errors/interpretPuppeteerError'
import { StructuredError } from '../../utils/StructuredError'
import { Browser, debug } from '../Browser'
export function rewriteError<T>() {
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
				ret = await originalFn.apply(browser, args)
			} catch (e) {
				debug('rewriteError lifting to StructuredError', propertyKey, e)
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
