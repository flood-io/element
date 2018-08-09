import { TitleCondition } from './conditions/TitleCondition'
import {
	ElementVisibilityCondition,
	ElementLocatedCondition,
	ElementsLocatedCondition,
} from './conditions/ElementVisibilityCondition'
import { ElementStateCondition } from './conditions/ElementStateCondition'
import { ElementSelectedCondition } from './conditions/ElementSelectedCondition'
import { ElementTextCondition } from './conditions/ElementTextCondition'
import { URLCondition } from './conditions/URLCondition'
import { DialogCondition } from './conditions/DialogCondition'
import { FrameCondition } from './conditions/FrameCondition'
import { Condition } from './Condition'
import { NullableLocatable, Locatable } from '../runtime/types'

/**
 * Until is used to create wait <[Conditions]> which are used to wait for elements to become active, visible, invisible or disabled on the page.
 *
 * You would typically use these to control the flow of you test.
 *
 * @class Until
 */
export class Until {
	/**
	 * Creates a condition that will wait until the input driver is able to switch to the designated frame.
	 *
	 * The target frame may be specified as:
	 * - string name of the frame to wait for matching the frame's `name` or `id` attribute.
	 * - (Coming soon) numeric index into window.frames for the currently selected frame.
	 * - (Coming soon) locator which may be used to first locate a FRAME or IFRAME on the current page before attempting to switch to it.
	 *
	 * Upon successful resolution of this condition, the driver will be left focused on the new frame.
	 */
	static ableToSwitchToFrame(frame: Locatable): Condition {
		return new FrameCondition('ableToSwitchToFrame', frame)
	}

	/**
	 * Creates a condition that waits for an alert to be opened. Upon success,
	 * the returned promise will be fulfilled with the handle for the opened alert.
	 */
	static alertIsPresent(): Condition {
		return new DialogCondition('alertIsPresent')
	}

	/**
	 * Creates a condition that will wait for the given element to be disabled
	 * @param selectorOrLocator A <[Locatable]> to use to find the element.
	 */
	static elementIsDisabled(selectorOrLocator: NullableLocatable): Condition {
		return new ElementStateCondition('elementIsDisabled', selectorOrLocator, true)
	}

	static elementIsEnabled(selectorOrLocator: NullableLocatable): Condition {
		return new ElementStateCondition('elementIsEnabled', selectorOrLocator, false)
	}

	static elementIsSelected(selectorOrLocator: NullableLocatable): Condition {
		return new ElementSelectedCondition('elementIsSelected', selectorOrLocator, true)
	}
	static elementIsNotSelected(selectorOrLocator: NullableLocatable): Condition {
		return new ElementSelectedCondition('elementIsNotSelected', selectorOrLocator, false)
	}

	/**
	 * Creates a condition that will wait for the given element to be selected.
	 *
	 * Example:
	 * ```typescript
	 * step("Step 1", async browser => {
	 *   await browser.wait(Until.elementIsVisible(By.partialLinkText("Start")))
	 * })
	 * ```
	 *
	 * @param selectorOrLocator A <[Locatable]> to use to find the element.
	 */
	static elementIsVisible(selectorOrLocator: NullableLocatable): Condition {
		return new ElementVisibilityCondition('elementIsVisible', selectorOrLocator, true, false)
	}

	static elementIsNotVisible(selectorOrLocator: NullableLocatable): Condition {
		return new ElementVisibilityCondition('elementIsNotVisible', selectorOrLocator, false, true)
	}

	static elementLocated(selectorOrLocator: NullableLocatable): Condition {
		return new ElementLocatedCondition('elementLocated', selectorOrLocator, true)
	}

	static elementTextIs(selectorOrLocator: NullableLocatable, text: string): Condition {
		return new ElementTextCondition('elementTextIs', selectorOrLocator, text, false)
	}

	static elementTextContains(selectorOrLocator: NullableLocatable, text: string): Condition {
		return new ElementTextCondition('elementTextContains', selectorOrLocator, text, true)
	}

	static elementTextMatches(selectorOrLocator: NullableLocatable, regex: RegExp): Condition {
		return new ElementTextCondition('elementTextMatches', selectorOrLocator, regex.toString())
	}

	/**
	 * Creates a condition that will wait until at least the desired number of elements are found.
	 */
	static elementsLocated(
		selectorOrLocator: NullableLocatable,
		desiredCount: number = 1,
	): Condition {
		return new ElementsLocatedCondition('elementsLocated', selectorOrLocator, desiredCount)
	}

	/**
	 * Creates a condition that will wait for the given element to become stale.
	 * An element is considered stale once it is removed from the DOM, or a new page has loaded.
	 */
	// static stalenessOf(selectorOrLocator: NullableLocatable): Condition {
	// 	return
	// }

	static titleContains(title: string): Condition {
		return new TitleCondition('titleContains', title, true)
	}

	static titleIs(title: string): Condition {
		return new TitleCondition('titleIs', title, false)
	}

	static titleMatches(title: RegExp): Condition {
		return new TitleCondition('titleMatches', `${title}`, false)
	}

	static urlContains(url: string): Condition {
		return new URLCondition('urlContains', url, true)
	}
	static urlIs(url: string): Condition {
		return new URLCondition('urlIs', url, false)
	}
	static urlMatches(url: RegExp): Condition {
		return new URLCondition('urlMatches', url.toString(), true)
	}
}
