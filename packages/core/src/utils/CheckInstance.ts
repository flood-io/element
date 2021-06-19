import {
	ElementTextCondition,
	ElementTextNotMatchCondition,
	FrameCondition,
	TitleCondition,
	TitleNotMatchCondition,
	URLCondition,
	URLNotMatchCondition,
} from '../page/conditions'
import { ElementHandle as TargetElementHandle } from '../page/ElementHandle'
import { BaseLocator } from '../page/Locator'
import { Point } from '../page/Point'
import { Locator, ScrollDirection, ElementHandle } from '../page/types'

export const isInstanceOf = (arg: unknown, conditions: Array<any>): boolean =>
	conditions.some((condition) => arg instanceof condition)

export const isAnElementHandle = (arg: unknown): boolean => isInstanceOf(arg, [TargetElementHandle])

export const isURLCondition = (arg: unknown): boolean =>
	isInstanceOf(arg, [URLCondition, URLNotMatchCondition])

export const isTitleCondition = (arg: unknown): boolean =>
	isInstanceOf(arg, [TitleCondition, TitleNotMatchCondition])

export const isFrameCondition = (arg: unknown): boolean => isInstanceOf(arg, [FrameCondition])

export const isElementTextCondition = (arg: unknown): boolean =>
	isInstanceOf(arg, [ElementTextCondition, ElementTextNotMatchCondition])

// Using for API scrollBy() and scrollTo()
export const isLocator = (
	target: Locator | ElementHandle | Point | ScrollDirection
): target is Locator => isInstanceOf(target, [BaseLocator])

// Using for API scrollBy() and scrollTo()
export const isPoint = (
	target: Locator | ElementHandle | Point | ScrollDirection
): target is Point => {
	return (
		Array.isArray(target) &&
		target.length === 2 &&
		typeof target[0] === 'number' &&
		typeof target[1] === 'number'
	)
}
