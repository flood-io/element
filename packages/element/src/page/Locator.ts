import { EvaluateFn, ExecutionContext, ElementHandle as PElementHandle, Frame } from 'puppeteer'
import { ElementHandle } from './ElementHandle'

export class NotImplementedError extends Error {
	constructor(public message = 'Method not implemented in DSL') {
		super(message)
	}
}

/**
 * @param {*} arg
 * @return {string}
 */
function serializeArgument(arg) {
	if (Object.is(arg, undefined)) return 'undefined'
	// if (typeof arg === 'function') return evaluationString(arg)
	return JSON.stringify(arg)
}

function evaluationString(fun, ...args) {
	return `(${fun})(${args.map(serializeArgument).join(',')})`
}

export type Locatable = Locator | ElementHandle | string

export class Locator {
	public pageFunc: EvaluateFn
	public pageFuncMany: EvaluateFn
	public pageFuncArgs: any[]

	async find(context: ExecutionContext, node?: PElementHandle): Promise<ElementHandle | null> {
		let handle = await context.evaluateHandle(this.pageFunc, ...this.pageFuncArgs, node)
		const element = handle.asElement()
		if (element) return new ElementHandle(element)
		return null
	}

	async findMany(context: ExecutionContext, node?: PElementHandle): Promise<ElementHandle[]> {
		const arrayHandle = await context.evaluateHandle(this.pageFuncMany, ...this.pageFuncArgs, node)
		const properties = await arrayHandle.getProperties()
		await arrayHandle.dispose()
		const result: ElementHandle[] = []
		for (const property of properties.values()) {
			const elementHandle = property.asElement()
			if (elementHandle) result.push(new ElementHandle(elementHandle))
		}
		return result
	}

	async wait(
		frame: Frame,
		waitFunc: EvaluateFn,
		waitFuncArgs: any[],
		options: any = {},
	): Promise<boolean> {
		const timeout = options.timeout || 3000
		const waitForVisible = !!options.visible
		const waitForHidden = !!options.hidden
		const polling = waitForVisible || waitForHidden ? 'raf' : 'mutation'

		let tmpArgs = waitFuncArgs.map((_, index) => `arg${index}`)
		let fn = `
let element = ${evaluationString(this.pageFunc, ...this.pageFuncArgs)}
let predicate = ${waitFunc}
return predicate(${['element', ...tmpArgs].join(', ')})`

		try {
			await frame.waitForFunction(
				new Function(...tmpArgs, fn),
				{ polling, timeout },
				...waitFuncArgs,
			)
		} catch (err) {
			console.error(err)
			return false
		}

		return true
	}
}
