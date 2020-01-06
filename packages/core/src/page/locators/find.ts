import { ExecutionContext, ElementHandle as PuppeteerElementHandle } from 'puppeteer'
import { ElementHandle as IElementHandle } from '../types'
import { ElementHandle } from '../ElementHandle'

export async function find(
	context: ExecutionContext,
	node?: PuppeteerElementHandle,
): Promise<IElementHandle | null> {
	let args = [...this.pageFuncArgs]
	if (node) args.push(node)
	let handle = await context.evaluateHandle(this.pageFunc, ...args)
	const element = handle.asElement()
	if (element) return new ElementHandle(element).initErrorString(this.toErrorString())
	return null
}
