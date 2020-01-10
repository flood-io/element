import { NullableLocatable } from './types'
import { Locator } from '../page/types'
import { By } from '../page/By'
import { LocatorErrorData } from './errors/Types'
import { StructuredError } from '../utils/StructuredError'

export function toLocatorError(
	locatable: NullableLocatable,
	callContext: string,
): StructuredError<LocatorErrorData> {
	let locatorString: string
	if (locatable == null) {
		locatorString = 'null locator'
	} else if (typeof locatable === 'string') {
		locatorString = locatable
	} else {
		locatorString = locatable.toErrorString?.() ?? 'internal locator function'
	}
	return new StructuredError<LocatorErrorData>(
		`No element was found on the page using '${locatorString}'`,
		{
			_kind: 'locator',
			kind: 'element-not-found',
			locator: locatorString,
		},
		undefined,
		'browser',
		callContext,
	)
}
export function locatableToLocator(el: NullableLocatable, callCtx: string): Locator | never {
	if (el === null) {
		throw toLocatorError(el, callCtx)
	} else if (typeof el === 'string') {
		return By.css(el)
	} else {
		// TODO proerly handle ElementHandle here...
		return el as Locator
	}
}
