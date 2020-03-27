import { PageFnOptions, Page, EvaluateFn, Frame } from 'puppeteer'
import { Locator } from './types'
import { DEFAULT_SETTINGS } from '../runtime/Settings'
import recast from 'recast'
import { locatableToLocator } from '../runtime/toLocatorError'
import { NullableLocatable } from '../runtime/types'

import debugFactory from 'debug'
const debug = debugFactory('element:page:condition')

export { NullableLocatable }

interface ConditionSettings {
	waitTimeout: number
}

/**
 * A Condition represents a predicate which can be used to wait for an <[ElementHandle]>. They are generally created by using <[Until]>'s helper methods.
 * @docOpaque
 */
export abstract class Condition {
	public hasWaitFor = true
	public settings: ConditionSettings = DEFAULT_SETTINGS

	constructor(public desc: string = '*BASE CONDITION') {}

	public abstract toString(): string
	public abstract async waitFor(frame: Frame, page?: Page): Promise<any>

	public abstract async waitForEvent(page: Page): Promise<any>

	protected get timeout(): number {
		return this.settings.waitTimeout * 1e3
	}
}

export abstract class LocatorCondition extends Condition {
	public pageFuncArgs: any[]
	public locator: Locator

	constructor(
		public desc: string = '*BASE CONDITION',
		locator: NullableLocatable,
		public pageFunc: EvaluateFn | null,
		...pageFuncArgs: any[]
	) {
		super(desc)
		this.locator = this.locatableToLocator(locator)
		this.pageFuncArgs = pageFuncArgs
	}

	/**
	 * @internal
	 */
	protected locatableToLocator(el: NullableLocatable): Locator {
		const e = new Error()
		Error.captureStackTrace(e)
		debug('e', e.stack)

		try {
			return locatableToLocator(el, `${this.desc}(locatable)`)
		} catch (e) {
			// TODO
			throw new Error(`condition '${this.desc}' unable to use locator: ${e}`)
		}
	}
}

export abstract class ElementCondition extends LocatorCondition {
	constructor(desc = '*BASE ELEMENT CONDITION', locator: NullableLocatable) {
		super(desc, locator, null)
	}

	public abstract toString(): string

	get locatorPageFunc(): EvaluateFn {
		return this.locator.pageFunc
	}

	public async waitFor(frame: Frame): Promise<boolean> {
		const argSeparator = '-SEP-'
		const options: PageFnOptions = { polling: 'raf', timeout: this.timeout }
		const locatorFunc = this.locatorPageFunc
		const conditionFunc = this.pageFunc

		const fn = function predicate(...args: any[]) {
			const argSeparator = '-SEP-'

			const args1: any[] = []
			const args2: any[] = []
			let foundSep = false
			for (const a of args) {
				if (!foundSep) {
					if (a === argSeparator) {
						foundSep = true
					} else {
						args1.push(a)
					}
				} else {
					args2.push(a)
				}
			}

			const locatorFunc: EvaluateFn = function() {
				return null
			}

			const [arg1, ...rest] = args1

			const node: HTMLElement | null = locatorFunc(arg1, ...rest)
			if (node === null) return false

			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const conditionFunc = function(node: HTMLElement, ...args2: any[]) {
				return false
			}

			return conditionFunc(node, ...args2)
		}

		const fnAST = recast.parse(fn.toString())
		const locatorFuncAST = recast.parse(locatorFunc.toString()).program.body[0]

		if (!conditionFunc) throw new Error(`Condition.pageFunc is not defined`)

		const conditionFuncAST = recast.parse(conditionFunc.toString()).program.body[0]

		recast.visit(fnAST, {
			visitVariableDeclaration(path: any) {
				if (path.node.declarations[0].id.name === 'locatorFunc') {
					path
						.get('declarations', 0)
						.get('init')
						.replace(locatorFuncAST)
				} else if (path.node.declarations[0].id.name === 'conditionFunc') {
					path
						.get('declarations', 0)
						.get('init')
						.replace(conditionFuncAST)
				}

				this.traverse(path)
			},
		})

		let code = recast.print(fnAST).code

		debug('waitFor code', code)

		const args = Array.prototype.concat(this.locator.pageFuncArgs, argSeparator, this.pageFuncArgs)
		debug('waitFor args', args)

		code = `(${code})(...args)`

		await frame.waitForFunction(code, options, ...args)

		return true
	}
}
