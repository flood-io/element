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
import { Locatable } from './Locator'

export class Until {
	static ableToSwitchToFrame(frame: string | Locatable): Condition {
		return new FrameCondition(frame)
	}

	/**
	 * Creates a condition that waits for an alert to be opened. Upon success,
	 * the returned promise will be fulfilled with the handle for the opened alert.
	 */
	static alertIsPresent(): Condition {
		return new DialogCondition()
	}

	static elementIsDisabled(selectorOrLocator: Locatable): Condition {
		return new ElementStateCondition(selectorOrLocator, true)
	}

	static elementIsEnabled(selectorOrLocator: Locatable): Condition {
		return new ElementStateCondition(selectorOrLocator, false)
	}

	static elementIsSelected(selectorOrLocator: Locatable): Condition {
		return new ElementSelectedCondition(selectorOrLocator, true)
	}
	static elementIsNotSelected(selectorOrLocator: Locatable): Condition {
		return new ElementSelectedCondition(selectorOrLocator, false)
	}

	static elementIsVisible(selectorOrLocator: Locatable): Condition {
		return new ElementVisibilityCondition(selectorOrLocator, true, false)
	}

	static elementIsNotVisible(selectorOrLocator: Locatable): Condition {
		return new ElementVisibilityCondition(selectorOrLocator, false, true)
	}

	static elementLocated(selectorOrLocator: Locatable): Condition {
		return new ElementLocatedCondition(selectorOrLocator, true)
	}

	static elementTextIs(selectorOrLocator: Locatable, text: string): Condition {
		return new ElementTextCondition(selectorOrLocator, text, false)
	}

	static elementTextContains(selectorOrLocator: Locatable, text: string): Condition {
		return new ElementTextCondition(selectorOrLocator, text, true)
	}

	static elementTextMatches(selectorOrLocator: Locatable, regex: RegExp): Condition {
		return new ElementTextCondition(selectorOrLocator, regex.toString())
	}

	/**
	 * Creates a condition that will wait until at least the desired number of elements are found.
	 */
	static elementsLocated(selectorOrLocator: Locatable, desiredCount: number = 1): Condition {
		return new ElementsLocatedCondition(selectorOrLocator, desiredCount)
	}

	/**
	 * Creates a condition that will wait for the given element to become stale.
	 * An element is considered stale once it is removed from the DOM, or a new page has loaded.
	 */
	// static stalenessOf(selectorOrLocator: Locatable): Condition {
	// 	return
	// }

	static titleContains(title: string): Condition {
		return new TitleCondition(title, true)
	}

	static titleIs(title: string): Condition {
		return new TitleCondition(title, false)
	}

	static titleMatches(title: RegExp): Condition {
		return new TitleCondition(`${title}`, false)
	}

	static urlContains(url: string): Condition {
		return new URLCondition(url, true)
	}
	static urlIs(url: string): Condition {
		return new URLCondition(url, false)
	}
	static urlMatches(url: RegExp): Condition {
		return new URLCondition(url.toString(), true)
	}
}
