import { ElementHandle as PlaywrightElementHandle, Frame, ElementHandle, Page } from 'playwright'
import { Locator, ElementHandle as IElementHandle, LocatorBuilder, EvaluateFn } from './types'

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
	constructor(private builder: LocatorBuilder, private errorString: string) {}

	get pageFunc(): EvaluateFn<HTMLElement | undefined> {
		return this.builder.pageFunc
	}

	get pageFuncMany(): EvaluateFn<HTMLElement | undefined> {
		return this.builder.pageFuncMany
	}

	get pageFuncArgs(): (string | ElementHandle<Node>)[] {
		return this.builder.pageFuncArgs
	}

	public toErrorString(): string {
		return this.errorString
	}

	async find(page: Page, node?: PlaywrightElementHandle): Promise<IElementHandle | null> {
		const args = [...this.pageFuncArgs]
		if (node) args.push(node)

		const handle = await page
			.evaluateHandle(() => this.pageFunc, ...args)
			.catch(err => {
				if (/Target closed/.test(err.message)) {
					return null
				}

				throw err
			})

		if (handle == null) return null

		const element = handle.asElement()

		const { ElementHandle } = await import('./ElementHandle')
		if (element) return new ElementHandle(element, page).initErrorString(this.toErrorString())
		return null
	}

	async findMany(page: Page, node?: PlaywrightElementHandle): Promise<IElementHandle[]> {
		const args = [...this.pageFuncArgs]
		if (node) args.push(node)
		const arrayHandle = await page
			.evaluateHandle(() => this.pageFuncMany, ...args)
			.catch(err => {
				if (/Target closed/.test(err.message)) {
					return null
				}

				throw err
			})

		if (!arrayHandle) return []

		const properties = await arrayHandle.getProperties()
		await arrayHandle.dispose()

		const thisErrorString = this.toErrorString()

		const elements: Promise<IElementHandle>[] = []

		const { ElementHandle } = await import('./ElementHandle')

		for (const property of properties.values()) {
			const elementHandle = property.asElement()
			if (elementHandle)
				elements.push(new ElementHandle(elementHandle, page).initErrorString(thisErrorString))
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

		const tmpArgs = waitFuncArgs.map((_, index) => `arg${index}`)
		const fn = `
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
