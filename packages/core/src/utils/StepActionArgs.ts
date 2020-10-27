import { BaseLocator } from './../page/Locator'
import {
	ElementVisibilityCondition,
	ElementTextCondition,
	ElementTextNotMatchCondition,
	ElementStateCondition,
	ElementSelectedCondition,
} from '../page/conditions/'

export const StepActionArgs = (args: any[]): string => {
	let result = ''

	const isInstanceOfCondition = (arg: any): boolean => {
		return (
			arg instanceof ElementVisibilityCondition ||
			arg instanceof ElementTextCondition ||
			arg instanceof ElementTextNotMatchCondition ||
			arg instanceof ElementStateCondition ||
			arg instanceof ElementSelectedCondition
		)
	}

	for (const arg of args) {
		if (typeof arg === 'string') {
			result = `'${arg}'`
			break
		}

		if (isInstanceOfCondition(arg)) {
			const locator: string = JSON.parse(JSON.stringify(arg.locator)).errorString
			result = `Util.${arg.desc}(${locator})`
			break
		}

		if (arg instanceof BaseLocator) {
			result = arg.toErrorString()
			break
		}
	}

	return result
}
