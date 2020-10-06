import { ElementHandle as PElementHandle, Frame, Page } from 'playwright'
import { Point } from './Point'

export enum BROWSER_TYPE {
	CHROME = 'chromium',
	FIREFOX = 'firefox',
	WEBKIT = 'webkit',
}

export type MouseButtons = 'left' | 'right' | 'middle'

export interface MousePressOptions {
	/**
	 * left, right, or middle.
	 * @default left
	 */
	button?: MouseButtons
	/**
	 * The number of clicks.
	 * @default 1
	 */
	clickCount?: number
}

export interface ClickOptions {
	/** @default MouseButtons.Left */
	button?: MouseButtons
	/** @default 1 */
	clickCount?: number
	/**
	 * Time to wait between mousedown and mouseup in milliseconds.
	 * @default 0
	 */
	delay?: number
}

export interface LocatorBuilder {
	pageFunc: EvaluateFn

	pageFuncMany: EvaluateFn

	pageFuncArgs: any[]

	toErrorString?(): string

	toString(): string
}

export type EvaluateFn<T = any> = string | ((arg1: T, ...args: any[]) => any)
export interface NavigationOptions {
	timeout?: number
	waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' | undefined
	referer?: string
}

/**
 * A Locator represents an object used to locate elements on the page. It is usually constructed using the helper methods of <[By]>.
 * An <[ElementHandle]> can also be used as a Locator which finds itself.
 *
 * @docOpaque
 */
export interface Locator extends LocatorBuilder {
	find(page: Page, frame?: Frame, node?: PElementHandle): Promise<ElementHandle | null>

	findMany(page: Page, frame?: Frame, node?: PElementHandle): Promise<ElementHandle[]>
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
	 *
	 * @param names Send file uploading
	 */
	uploadFile(...names: string[]): Promise<void>

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
	 * getProperty
	 */
	getProperty(key: string): Promise<string | null>

	/**
	 * Returns the x,y coordinates of the center point of the element
	 */
	centerPoint(): Promise<Point>

	/**
	 * @internal
	 */
	toErrorString(): string

	dispose(): Promise<void>
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

export interface BoundingBox {
	/** The x-coordinate of top-left corner. */
	x: number
	/** The y-coordinate of top-left corner. */
	y: number
	/** The width. */
	width: number
	/** The height. */
	height: number
}

export interface ScreenshotOptions {
	/**
	 * The file path to save the image to. The screenshot type will be inferred from file extension.
	 * If `path` is a relative path, then it is resolved relative to current working directory.
	 * If no path is provided, the image won't be saved to the disk.
	 */
	path?: string
	/**
	 * The screenshot type.
	 * @default png
	 */
	type?: 'jpeg' | 'png'
	/** The quality of the image, between 0-100. Not applicable to png images. */
	quality?: number
	/**
	 * When true, takes a screenshot of the full scrollable page.
	 * @default false
	 */
	fullPage?: boolean
	/**
	 * An object which specifies clipping region of the page.
	 */
	clip?: BoundingBox
	/**
	 * Hides default white background and allows capturing screenshots with transparency.
	 * @default false
	 */
	omitBackground?: boolean
	/**
	 * The encoding of the image, can be either base64 or binary.
	 * @default binary
	 */
	encoding?: 'base64' | 'binary'
}
