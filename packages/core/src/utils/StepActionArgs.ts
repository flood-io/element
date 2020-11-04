import { BaseLocator } from './../page/Locator'
import {
	DialogCondition,
	ElementSelectedCondition,
	ElementStateCondition,
	ElementTextCondition,
	ElementTextNotMatchCondition,
	ElementVisibilityCondition,
	FrameCondition,
	TitleCondition,
	TitleNotMatchCondition,
	URLCondition,
	URLNotMatchCondition,
	ElementLocatedCondition,
	ElementsLocatedCondition,
} from '../page/conditions/'
import { ElementHandle } from './../page/ElementHandle'

export const StepActionArgs = (args: any[]): string => {
	let result = ''

	const conditions = [
		DialogCondition,
		ElementSelectedCondition,
		ElementStateCondition,
		ElementTextCondition,
		ElementTextNotMatchCondition,
		ElementVisibilityCondition,
		FrameCondition,
		TitleCondition,
		TitleNotMatchCondition,
		URLCondition,
		URLNotMatchCondition,
		ElementLocatedCondition,
		ElementsLocatedCondition,
		ElementHandle,
	]

	const isInstaceOf = (arg: any, conditions: Array<any>) =>
		conditions.some(condition => arg instanceof condition)

	const isAnElementHandle = (arg: any): boolean => isInstaceOf(arg, [ElementHandle])

	const isURLCondition = (arg: any): boolean =>
		isInstaceOf(arg, [URLCondition, URLNotMatchCondition])

	const isTitleCondition = (arg: any): boolean =>
		isInstaceOf(arg, [TitleCondition, TitleNotMatchCondition])

	const isFrameCondition = (arg: any): boolean => isInstaceOf(arg, [FrameCondition])

	const isElementTextCondition = (arg: any): boolean =>
		isInstaceOf(arg, [ElementTextCondition, ElementTextNotMatchCondition])

	const getErrorString = (locator: ElementHandle | BaseLocator): string => {
		if (locator instanceof ElementHandle) {
			const locatorArr = locator.toErrorString().split(`'`)
			// Peek last 3 items
			return locatorArr.slice(locatorArr.length - 4, locatorArr.length - 1).join(`'`)
		}
		return locator.toErrorString()
	}

	// Handle for param is pass to browser action as RegExp or string
	const handleRegExpOrString = (desc: string, param: string): string =>
		desc.toLowerCase().includes('match') ? param : `'${param}'`

	for (const arg of args) {
		try {
			result += result.length && args.indexOf(arg) !== 0 ? ', ' : ''

			if (isInstaceOf(arg, conditions)) {
				let content = ''
				const description = arg.desc ? arg.desc : ''

				if (isAnElementHandle(arg)) {
					result += getErrorString(arg)
					continue
				}

				if ('locator' in arg) {
					if (isAnElementHandle(arg.locator) && !isElementTextCondition(arg)) {
						result += getErrorString(arg.locator)
						continue
					}
					content = getErrorString(arg.locator)
				}

				if (isElementTextCondition(arg)) {
					content = `${getErrorString(arg.locator)}, ${handleRegExpOrString(
						description,
						arg.pageFuncArgs[0],
					)}`
				}

				if (isURLCondition(arg)) {
					content = handleRegExpOrString(description, arg.url)
				}

				if (isTitleCondition(arg)) {
					content = handleRegExpOrString(description, arg.expectedTitle)
				}

				if (isFrameCondition(arg)) {
					content = `'${arg.id}'`
				}

				result += `Until.${description}(${content})`
				continue
			}

			if (isInstaceOf(arg, [BaseLocator])) {
				result += getErrorString(arg)
				continue
			}

			const argType = typeof arg
			switch (argType) {
				case 'string':
					result += `'${arg}'`
					continue
				case 'number':
					result += arg
					continue
				case 'object':
					result += JSON.stringify(arg)
					continue
				default:
					continue
			}
		} catch (err) {
			break
		}
	}

	return result
}
