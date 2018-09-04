import { ClickOptions, ScreenshotOptions } from 'puppeteer'
// import { Key } from './Enums'
// import { Locator } from './Locator'
import { EvaluateFn, ExecutionContext, ElementHandle as PElementHandle } from 'puppeteer'

/**
 * A Locator represents an object used to locate elements on the page. It is usually constructed using the helper methods of <[By]>.
 * An <[ElementHandle]> can also be used as a Locator which finds itself.
 *
 * @docOpaque
 */
export interface Locator {
	pageFunc: EvaluateFn

	pageFuncMany: EvaluateFn

	pageFuncArgs: any[]

	toErrorString(): string

	find(context: ExecutionContext, node?: PElementHandle): Promise<ElementHandle | null>

	findMany(context: ExecutionContext, node?: PElementHandle): Promise<ElementHandle[]>
}

/**
 * Example Handle represents a remote element in the DOM of the browser. It implements useful methods for querying and interacting with this DOM element.
 *
 * All methods on this class are asynchronous and must be used with `await` to wait for the result to fulfill from the browser.
 */
export interface ElementHandle {
	/**
	 * @internal
	 */
	element: PElementHandle

	/**
	 * @internal
	 */
	bindBrowser(browser: any): void

	/**
	 * Fetches the value of an attribute on this element
	 */
	getAttribute(key: string): Promise<string | null>

	/**
	 * Sends a click event to the element attached to this handle. If the element is
	 * currently outside the viewport it will first scroll to that element.
	 */
	click(options?: ClickOptions): Promise<void>

	/**
	 * Schedules a command to clear the value of this element.
	 * This command has no effect if the underlying DOM element is neither a text
	 * INPUT, SELECT, or a TEXTAREA element.
	 */
	clear(): Promise<void>

	/**
	 * Sends a series of key modifiers to the element.
	 */
	sendKeys(...keys: string[]): Promise<void>

	/**
	 * Sends a series of key presses to the element to simulate a user typing on the keyboard. Use this to fill in input fields.
	 */
	type(text: string): Promise<void>

	/**
	 * Sends focus to this element so that it receives keyboard inputs.
	 */
	focus(): Promise<void>

	/**
	 * Clears focus from this element so that it will no longer receive keyboard inputs.
	 */
	blur(): Promise<void>

	highlight(): Promise<void>

	/**
	 * Takes a screenshot of this element and saves it to the results folder with a random name.
	 */
	takeScreenshot(options?: ScreenshotOptions): Promise<void>

	/**
	 * Locates an element using the supplied <[Locator]>, returning an <[ElementHandle]>.
	 */
	findElement(locator: string | Locator): Promise<ElementHandle | null>

	/**
	 * Locates all elements using the supplied <[Locator]>, returning an array of <[ElementHandle]>s.
	 */
	findElements(locator: Locator | string): Promise<ElementHandle[]>

	/**
	 * Fetches the remote elements `tagName` property.
	 */
	tagName(): Promise<string | null>

	/**
	 * Fetches the remote elements `id` attribute.
	 */
	getId(): Promise<string | null>

	/**
	 * If the remote element is selectable (such as an `<option>` or `input[type="checkbox"]`) this methos will indicate whether it is selected.
	 */
	isSelected(): Promise<boolean>

	/**
	 * Checks whether the remote element is selectable. An element is selectable if it is an `<option>` or `input[type="checkbox"]` or radio button.
	 */
	isSelectable(): Promise<boolean>

	/**
	 * Checks whether the remote element is displayed in the DOM and is visible to the user without being hidden by CSS or occluded by another element.
	 */
	isDisplayed(): Promise<boolean>

	/**
	 * Checks whether the remote element is enabled. Typically this means it does not have a `disabled` property or attribute applied.
	 */
	isEnabled(): Promise<boolean>

	/**
	 * Retrieves the text content of this element excluding leading and trailing whitespace.
	 */
	text(): Promise<string>

	/**
	 * Fetches the remote elements physical dimensions as `width` and `height`.
	 */
	size(): Promise<{ width: number; height: number }>

	/**
	 * Fetches the remote elements physical location as `x` and `y`.
	 */
	location(): Promise<{ x: number; y: number }>

	/**
	 * @internal
	 */
	toErrorString(): string
}

/**
 * The target locator is accessed through `browser.switchTo()` and enables you to switch frames, tabs, or browser windows. As well as access the `activeElement` or an alert box.
 *
 * @class TargetLocator
 */
export interface TargetLocator {
	/**
	 * Locates the DOM element on the current page that corresponds to
	 * `document.activeElement` or `document.body` if the active element is not
	 * available.
	 */
	activeElement(): Promise<ElementHandle | null>

	/**
	 * Navigates to the topmost frame
	 */
	defaultContent(): Promise<void>

	/**
	 * Changes the active target to another frame.
	 *
	 * Accepts either:
	 *
	 * number: Switch to frame by index in window.frames,
	 * string: Switch to frame by frame.name or frame.id, whichever matches first,
	 * ElementHandle: Switch to a frame using the supplied ElementHandle of a frame.
	 *
	 * @param id number | string | ElementHandle
	 */
	frame(id: number | string | ElementHandle): Promise<void>
}
