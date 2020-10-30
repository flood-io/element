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

		if (argType === 'string' || argType === 'number') {
			result += argType === 'string' ? `'${arg}'` : arg
			continue
		}

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
			if (argType === 'object') {
				result += JSON.stringify(arg)
				continue
			}
		} catch (err) {
			break
		}
	}

	return result
}
