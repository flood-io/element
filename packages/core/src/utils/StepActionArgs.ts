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
	]

	const isInstanceOfCondition = (arg: any): boolean =>
		conditions.some(condition => arg instanceof condition)

	const isAnElementHandle = (arg: any): boolean => arg instanceof ElementHandle

	const getErrorStringOfElementHandle = (locator: ElementHandle): string => {
		const locatorArr = locator.toErrorString().split(`'`)
		return locatorArr
			.filter((el, index) => index !== 0 && index !== locatorArr.length - 1)
			.join(`'`)
	}

	for (const arg of args) {
		const argType = typeof arg

		try {
			result += result.length && args.indexOf(arg) !== 0 ? ', ' : ''

			if (isAnElementHandle(arg)) {
				result += getErrorStringOfElementHandle(arg)
				continue
			}

			if (isInstanceOfCondition(arg)) {
				if (isAnElementHandle(arg.locator)) {
					result += getErrorStringOfElementHandle(arg.locator)
					continue
				} else {
					const locator: string = JSON.parse(JSON.stringify(arg.locator)).errorString
					result += `Until.${arg.desc}(${locator})`
					continue
				}
			}

			if (arg instanceof BaseLocator) {
				result += arg.toErrorString()
				continue
			}

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
