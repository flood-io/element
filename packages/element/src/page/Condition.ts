import { PageFnOptions, Page, EvaluateFn, Frame } from 'puppeteer'
import { DEFAULT_SETTINGS } from '../runtime/VM'
import { Locatable } from './Locator'
import * as recast from 'recast'
import * as prettier from 'prettier'
import { locatableToLocator } from './By'
import { TestSettings } from '../../index'

export abstract class Condition {
	public pageFuncArgs: any[]
	public hasWaitFor = true
	public settings: TestSettings = DEFAULT_SETTINGS

	constructor(
		public locator: Locatable | null,
		public pageFunc: EvaluateFn | null,
		...pageFuncArgs: any[]
	) {
		this.pageFuncArgs = pageFuncArgs
	}

	public abstract toString()
	public abstract async waitFor(frame: Frame, page?: Page): Promise<any>

	public async waitForEvent(page: Page): Promise<any> {
		return
	}

	protected get timeout(): number {
		let { waitTimeout } = this.settings
		return waitTimeout * 1e3
	}
}

export abstract class ElementCondition extends Condition {
	constructor(public locator: Locatable) {
		super(locator, null)
	}

	public abstract toString()

	get locatorPageFunc() {
		let locator = locatableToLocator(this.locator)
		return locator.pageFunc
	}

	public async waitFor(frame: Frame): Promise<boolean> {
		let { waitTimeout } = this.settings
		let options: PageFnOptions = { polling: 'raf', timeout: waitTimeout * 1e3 }
		let locator = locatableToLocator(this.locator)
		let locatorFunc = this.locatorPageFunc
		let conditionFunc = this.pageFunc

		let fn = function predicate(args1: any[], args2: any[]) {
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

		let args = [locator.pageFuncArgs, this.pageFuncArgs]
		let execFnStr = `${code.trim()}(${args.map(serializeArgument).join(',')})`
		// console.log(code, locator.pageFuncArgs, this.pageFuncArgs)

		await frame.waitForFunction(execFnStr, options)

		return true

		function serializeArgument(arg) {
			if (Object.is(arg, undefined)) return 'undefined'
			return JSON.stringify(arg)
		}
	}
}
