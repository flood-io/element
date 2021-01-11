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

export const isInstanceOf = (arg: any, conditions: Array<any>) =>
	conditions.some(condition => arg instanceof condition)

export const isAnElementHandle = (arg: any): boolean => isInstanceOf(arg, [TargetElementHandle])

export const isURLCondition = (arg: any): boolean =>
	isInstanceOf(arg, [URLCondition, URLNotMatchCondition])

export const isTitleCondition = (arg: any): boolean =>
	isInstanceOf(arg, [TitleCondition, TitleNotMatchCondition])

export const isFrameCondition = (arg: any): boolean => isInstanceOf(arg, [FrameCondition])

export const isElementTextCondition = (arg: any): boolean =>
	isInstanceOf(arg, [ElementTextCondition, ElementTextNotMatchCondition])

export const isLocator = (
	target: Locator | ElementHandle | Point | ScrollDirection,
): target is Locator => {
	return target instanceof BaseLocator
}

export const isPoint = (
	target: Locator | ElementHandle | Point | ScrollDirection,
): target is Point => {
	return (
		Array.isArray(target) &&
		target.length === 2 &&
		typeof target[0] === 'number' &&
		typeof target[1] === 'number'
	)
}
