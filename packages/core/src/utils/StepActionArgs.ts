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

	const isInstanceOfCondition = (arg: any): boolean => {
		return conditions.some(condition => arg instanceof condition)
	}

	for (const arg of args) {
		const argType = typeof arg

		result += result.length && args.indexOf(arg) !== 0 ? ', ' : ''

		if (isInstanceOfCondition(arg)) {
			const locator: string = JSON.parse(JSON.stringify(arg.locator)).errorString
			result += `Until.${arg.desc}(${locator})`
			continue
		}

		if (arg instanceof BaseLocator) {
			result += arg.toErrorString()
			continue
		}

		try {
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
