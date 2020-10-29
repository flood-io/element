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
		if (argType === 'string' || argType === 'number') {
			result = argType === 'string' ? `'${arg}'` : arg
			break
		}

		if (isInstanceOfCondition(arg)) {
			const locator: string = JSON.parse(JSON.stringify(arg.locator)).errorString
			result = `Until.${arg.desc}(${locator})`
			break
		}

		if (arg instanceof BaseLocator) {
			result = arg.toErrorString()
			break
		}
	}

	return result
}
