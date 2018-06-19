import * as debug from 'debug'
const debugSandbox = debug('sandbox')

/**
 * Defines a Function Decorator which wraps a method with class local before and after
 * hooks, as well as custom error handling.
 */
export function wrapWithCallbacks() {
	return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
		let originalFn = descriptor.value

		descriptor.value = async function(...args: any[]) {
			let ret

			if (this.lastError) {
				debugSandbox(`Skipping driver.${propertyKey}()`)
				if (this.onSkip instanceof Function) await this.onSkip(propertyKey)
				return
			}

			try {
				if (this.beforeFunc instanceof Function) await this.beforeFunc(propertyKey)

				// let argsDesciption = args
				// 	.filter(arg => arg['toString'])
				// 	.map(arg => {
				// 		let s = arg.toString()
				// 		if (s === '[object Object]') {
				// 			s = JSON.stringify(arg)
				// 		}
				// 		return s
				// 	})
				// 	.join(', ')

				ret = await originalFn.apply(this, args)
				if (this.afterFunc instanceof Function) await this.afterFunc(propertyKey)
			} catch (err) {
				debugSandbox(err)
				if (this.onError instanceof Function) {
					this.lastError = err
					await this.onError(err, propertyKey)
					return
				}
			}
			return ret
		}

		return descriptor
	}
}
