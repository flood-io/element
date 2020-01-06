import { EvaluateFn, ExecutionContext, ElementHandle as PElementHandle, Frame } from 'puppeteer'
import { ElementHandle } from './Locators'
import { Locator } from './types'

export class NotImplementedError extends Error {
	constructor(public message = 'Method not implemented in DSL') {
		super(message)
	}
}

function serializeArgument(arg: any | undefined): string {
	if (Object.is(arg, undefined)) return 'undefined'
	// if (typeof arg === 'function') return evaluationString(arg)
	return JSON.stringify(arg)
}

function evaluationString(fun: any, ...args: any[]): string {
	return `(${fun})(${args.map(serializeArgument).join(',')})`
}

export class BaseLocator implements Locator {
	public pageFunc: EvaluateFn
	public pageFuncMany: EvaluateFn
	public pageFuncArgs: any[]

	constructor(protected errorString: string) {}

	public toErrorString(): string {
		return this.errorString
	}

	async find(context: ExecutionContext, node?: PElementHandle): Promise<ElementHandle | null> {
		let args = [...this.pageFuncArgs]
		if (node) args.push(node)
		let handle = await context.evaluateHandle(this.pageFunc, ...args)
		const element = handle.asElement()
		if (element) return new ElementHandle(element).initErrorString(this.toErrorString())
		return null
	}

	async findMany(context: ExecutionContext, node?: PElementHandle): Promise<ElementHandle[]> {
		let args = [...this.pageFuncArgs]
		if (node) args.push(node)
		const arrayHandle = await context.evaluateHandle(this.pageFuncMany, ...args)

		if (!arrayHandle) return []

		const properties = await arrayHandle.getProperties()
		await arrayHandle.dispose()

		const thisErrorString = this.toErrorString()

		const elements: Promise<ElementHandle>[] = []

		for (const property of properties.values()) {
			const elementHandle = property.asElement()
			if (elementHandle)
				elements.push(new ElementHandle(elementHandle).initErrorString(thisErrorString))
		}

		return Promise.all(elements)
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
				new Function(...tmpArgs, fn).toString(),
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
