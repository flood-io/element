import { Page, Frame } from 'playwright'
import { Locator, EvaluateFn } from './types'
import { DEFAULT_SETTINGS, DEFAULT_WAIT_TIMEOUT_MILLISECONDS } from '../runtime/Settings'
import recast from 'recast'
import { locatableToLocator } from '../runtime/toLocatorError'
import { NullableLocatable } from '../runtime/Locatable'
import ms from 'ms'

import debugFactory from 'debug'
const debug = debugFactory('element:page:condition')

export { NullableLocatable }

interface ConditionSettings {
	waitTimeout: number | string
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
	public abstract waitFor(frame: Frame, page?: Page): Promise<unknown>

	public abstract waitForEvent(page: Page): Promise<unknown>

	protected get timeout(): string | number {
		if (typeof this.settings.waitTimeout === 'string' && this.settings.waitTimeout) {
			return ms(this.settings.waitTimeout)
		}
		if (typeof this.settings.waitTimeout === 'number' && this.settings.waitTimeout <= 0) {
			return DEFAULT_WAIT_TIMEOUT_MILLISECONDS
		}
		return this.settings.waitTimeout
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
		const e = new Error('unable to use locator')
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
		const options: any = { polling: 'raf', timeout: this.timeout }
		const locatorFunc = this.locatorPageFunc
		const conditionFunc = this.pageFunc

		const fn = (args: any[]) => {
			const indexSep = args.indexOf('-SEP-')
			const args1: any[] = args.slice(0, indexSep)
			const args2: any[] = args.slice(indexSep + 1, args.length)

			const locatorFunc: EvaluateFn = () => null
			const conditionFunc = (node: HTMLElement, ...args: any[]) => false

			const [arg1, ...rest] = args1
			const node: HTMLElement | null = locatorFunc(arg1, ...rest)
			if (node === null) return false
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

		const compiledFunc = recast.print(fnAST).code
		debug('waitFor code', compiledFunc)

		const args = Array.prototype.concat(this.locator.pageFuncArgs, argSeparator, this.pageFuncArgs)
		debug('waitFor args', args)

		await frame
			.waitForFunction(
				args => {
					const [fn, ...rest] = args
					return eval(fn)(rest)
				},
				[compiledFunc, ...args],
				options,
			)
			.catch(err => console.log(err))
		return true
	}
}
