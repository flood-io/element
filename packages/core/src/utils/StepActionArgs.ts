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
			// console.log(arg)
			result = `'${arg}'`
			break
		}
	}

	if (result === '') {
		if (isInstanceOfCondition(args[0])) {
			const locator: string = JSON.parse(JSON.stringify(args[0].locator)).errorString
			result = `Util.${args[0].desc}(${locator})`
		} else if (args[0] instanceof BaseLocator) {
			result = args[0].toErrorString()
		} else {
			console.log(args[0])
		}
	}

	// console.log(result)

	return result
}
