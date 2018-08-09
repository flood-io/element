import { PageFnOptions, Page, EvaluateFn, Frame } from 'puppeteer'
import { Locator } from './Locator'
import { DEFAULT_SETTINGS } from '../runtime/Settings'
import * as recast from 'recast'
import * as prettier from 'prettier'
import { locatableToLocator } from '../runtime/Browser'
import { NullableLocatable } from '../runtime/types'

// import * as debugFactory from 'debug'
// const debug = debugFactory('element:page:condition')

export { NullableLocatable }

interface ConditionSettings {
	waitTimeout: number
}

export abstract class Condition {
	public pageFuncArgs: any[]
	public hasWaitFor = true
	// TODO decouple this hardcoding
	public settings: ConditionSettings = DEFAULT_SETTINGS
	public locator: Locator

	constructor(
		public desc: string = '*BASE CONDITION',
		locator: NullableLocatable,
		public pageFunc: EvaluateFn | null,
		...pageFuncArgs: any[]
	) {
		this.locator = this.locatableToLocator(locator)
		this.pageFuncArgs = pageFuncArgs
	}

	protected locatableToLocator(el: NullableLocatable): Locator {
		try {
			return locatableToLocator(el, `${this.desc}(locatable)`)
		} catch (e) {
			// TODO
			throw new Error(`condition '${this.desc}' unable to use locator: ${e}`)
		}
	}

	public abstract toString()
	public abstract async waitFor(frame: Frame, page?: Page): Promise<any>

	public async waitForEvent(page: Page): Promise<any> {
		return
	}

	protected get timeout(): number {
		return this.settings.waitTimeout * 1e3
	}
}

export abstract class ElementCondition extends Condition {
	constructor(desc: string = '*BASE ELEMENT CONDITION', locator: NullableLocatable) {
		super(desc, locator, null)
	}

	public abstract toString()

	get locatorPageFunc(): EvaluateFn {
		return this.locator.pageFunc
	}

	public async waitFor(frame: Frame): Promise<boolean> {
		const argSeparator = '-SEP-'
		let options: PageFnOptions = { polling: 'raf', timeout: this.timeout }
		let locatorFunc = this.locatorPageFunc
		let conditionFunc = this.pageFunc

		let fn = function predicate(...args: any[]) {
			let args1: any[] = []
			let args2: any[] = []
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

			let locatorFunc: EvaluateFn = function() {
				return null
			}
			let node: HTMLElement | null = locatorFunc(...args1)
			if (node === null) return false

			let conditionFunc = function(node, ...args2) {
				return false
			}
			return conditionFunc(node, ...args2)
		}

		let fnAST = recast.parse(fn.toString())
		let locatorFuncAST = recast.parse(locatorFunc.toString()).program.body[0]

		if (!conditionFunc) throw new Error(`Condition.pageFunc is not defined`)

		let conditionFuncAST = recast.parse(conditionFunc.toString()).program.body[0]

		recast.visit(fnAST, {
			visitVariableDeclaration(path) {
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

		let code = prettier.format(recast.print(fnAST).code, { parser: 'babylon' })

		let args = Array.prototype.concat(this.locator.pageFuncArgs, argSeparator, this.pageFuncArgs)

		await frame.waitForFunction(code, options, ...args)

		return true
	}
}
