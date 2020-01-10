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
 * Until contains a wealth of useful <Condition>s.
 *
 * <[Condition]>s represent predicates used to wait for something to become true.
 *
 * These predicates include waiting for elements to become active, visible, invisible or disabled on the page.
 *
 * You typically use these to control the flow of you test.
 *
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

	/**
	 * Creates a condition that will wait for the given element to be enabled
	 * @param selectorOrLocator A <[Locatable]> to use to find the element.
	 */
	static elementIsEnabled(selectorOrLocator: NullableLocatable): Condition {
		return new ElementStateCondition('elementIsEnabled', selectorOrLocator, false)
	}

	/**
	 * Creates a condition that will wait for the given element to be deselected.
	 * @param selectorOrLocator A <[Locatable]> to use to find the element.
	 */
	static elementIsSelected(selectorOrLocator: NullableLocatable): Condition {
		return new ElementSelectedCondition('elementIsSelected', selectorOrLocator, true)
	}

	/**
	 * Creates a condition that will wait for the given element to be in the DOM, yet not visible to the user
	 * @param selectorOrLocator A <[Locatable]> to use to find the element.
	 */
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

	/**
	 * Creates a condition that will wait for the given element to become visible.
	 *
	 * Example:
	 * ```typescript
	 * step("Step 1", async browser => {
	 * 	 await browser.click(By.css('.hide-panel'))
	 *   await browser.wait(Until.elementIsNotVisible(By.id("btn")))
	 * })
	 * ```
	 *
	 * @param selectorOrLocator A <[Locatable]> to use to find the element.
	 */
	static elementIsNotVisible(selectorOrLocator: NullableLocatable): Condition {
		return new ElementVisibilityCondition('elementIsNotVisible', selectorOrLocator, false, true)
	}

	/**
	 * Creates a condition which will wait until the element is located on the page.
	 */
	static elementLocated(selectorOrLocator: NullableLocatable): Condition {
		return new ElementLocatedCondition('elementLocated', selectorOrLocator, true)
	}

	/**
	 * Creates a condition which will wait until the element's text exactly matches the target text, excluding leading and trailing whitespace.
	 */
	static elementTextIs(selectorOrLocator: NullableLocatable, text: string): Condition {
		return new ElementTextCondition('elementTextIs', selectorOrLocator, text, false)
	}

	/**
	 * Creates a condition which will wait until the element's text content contains the target text.
	 */
	static elementTextContains(selectorOrLocator: NullableLocatable, text: string): Condition {
		return new ElementTextCondition('elementTextContains', selectorOrLocator, text, true)
	}

	/**
	 * Creates a condition which will wait until the element's text matches the target Regular Expression.
	 */
	static elementTextMatches(selectorOrLocator: NullableLocatable, regex: RegExp): Condition {
		return new ElementTextCondition('elementTextMatches', selectorOrLocator, regex.toString())
	}

	/**
	 * Creates a condition that will wait until at least the desired number of elements are found.
	 */
	static elementsLocated(selectorOrLocator: NullableLocatable, desiredCount = 1): Condition {
		return new ElementsLocatedCondition('elementsLocated', selectorOrLocator, desiredCount)
	}

	/**
	 * Creates a condition that will wait for the given element to become stale.
	 * An element is considered stale once it is removed from the DOM, or a new page has loaded.
	 */
	// static stalenessOf(selectorOrLocator: NullableLocatable): Condition {
	// 	return
	// }

	/**
	 * Creates a condition which waits until the page title contains the expected text.
	 */
	static titleContains(title: string): Condition {
		return new TitleCondition('titleContains', title, true)
	}

	/**
	 * Creates a condition which waits until the page title exactly matches the expected text.
	 */
	static titleIs(title: string): Condition {
		return new TitleCondition('titleIs', title, false)
	}

	/**
	 * Creates a condition which waits until the page title matches the title `RegExp`.
	 */
	static titleMatches(title: RegExp): Condition {
		return new TitleCondition('titleMatches', `${title}`, false)
	}

	/**
	 * Creates a condition which waits until the page URL contains the expected path.
	 */
	static urlContains(url: string): Condition {
		return new URLCondition('urlContains', url, true)
	}

	/**
	 * Creates a condition which waits until the page URL exactly matches the expected URL.
	 */
	static urlIs(url: string): Condition {
		return new URLCondition('urlIs', url, false)
	}

	/**
	 * Creates a condition which waits until the page URL matches the supplied `RegExp`.
	 */
	static urlMatches(url: RegExp): Condition {
		return new URLCondition('urlMatches', url.toString(), true)
	}
}
