// Type definitions for @flood/chrome 0.1.12
// Project: @flood/chrome
// Definitions by: Ivan Vanderbyl <github.com/ivanvanderbyl>

/**
 * This interface specifies the available options you can use to configure how your test runs. These properties should be exported using the property `settings`.
 *
 * **Example:**
 *
 * ```typescript
 * export const settings = {
 *   loopCount: Infinity,
 *   clearCache: true
 * }
 * ```
 *
 * @export
 * @interface TestSettings
 */
export interface TestSettings {
	/**
	 * Maximum duration to run this for, regardless of other timeouts specified on Flood.
	 *
	 * Defaults to `-1` for no timeout.
	 */
	duration?: number

	/**
	 * Number of times to run this test.
	 * Defaults to `-1` for infinite.
	 */
	loopCount?: number

	/**
	 * Specifies the time (in seconds) to wait between each action call, to simulate a normal user
	 * thinking about what to do next.
	 */
	actionDelay?: number

	/**
	 * Specifies the time (in seconds) to wait after each step.
	 */
	stepDelay?: number

	/**
	 * Specifies a custom User Agent (UA) string to send.
	 */
	userAgent?: string

	/**
	 * Specifies a device to emulate with browser device emulation.
	 */
	device?: string

	/**
	 * Global wait timeout applied to all wait tasks
	 */
	waitTimeout?: number

	/**
	 * Specifies whether cookies should be cleared after each loop.
	 *
	 * @default true
	 */
	clearCookies?: boolean

	/**
	 * Specifies whether Brwoser cache should be cleared after each loop.
	 *
	 * @default false
	 */
	clearCache?: boolean

	/**
	 * Disables browser request cache for all requests.
	 */
	disableCache?: boolean

	/**
	 * Speicifies the name of the test specified in the comments section
	 */
	name?: string

	/**
	 * Speicifies the description of the test specified in the comments section
	 */
	description?: string

	/**
	 * Take a screenshot of the page when a command fails, to aid in debugging.
	 *
	 * Screenshots are saved to `/flood/result/screenshots` in the test archive.
	 */
	screenshotOnFailure?: boolean

	/**
	 * Take a DOM snapshot of the page when a command fails, to aid in debugging.
	 */
	DOMSnapshotOnFailure?: boolean

	/**
	 * Configures how we record response time for each step.
	 *
	 * Possible values:
	 * - `"page"`: Record the document loading response time. This is usually what you consider response time on paged web apps.
	 * - `"network"`: Takes the mean response time of all network requests which occur during a step. This is useful for Single Page Application which don't actually trigger a navigation.
	 * - `"step"`: (Default) Records the wall clock time of a step. This is useful for Single Page Application which don't actually trigger a navigation.
	 * - `"stepWithThinkTime"`: Records the wall clock time of a step including `actionDelay` time.
	 */
	responseTimeMeasurement?: ResponseTiming

	/**
	 * Filters the console output from the target site to log output. Useful for very noisy tests. This won't affect console output from within your script.
	 */
	consoleFilter?: ConsoleMethod[]

	/**
	 * Whether to ignore HTTPS errors during navigation. Defaults to `false`
	 */
	ignoreHTTPSErrors?: boolean
}

/**
 * Specifies an option for how to record response time.
 */
type ResponseTiming =
	/**
	 * Record the document loading response time. This is usually what you consider response time on paged web apps.
	 */
	| 'page'

	/**
	 * (Experimental) Takes the mean response time of all network requests which occur during a step. This is useful for Single Page Application which don't actually trigger a navigation.
	 */
	| 'network'

	/**
	 * (Default) Records the wall clock time of a step. This is useful for Single Page Application which don't actually trigger a navigation.
	 */
	| 'step'

	/**
	 * `"stepWithThinkTime"`: Records the wall clock time of a step including `actionDelay` time.
	 */
	| 'stepWithThinkTime'

/**
 * Specifies a `console` method
 */
type ConsoleMethod = 'log' | 'info' | 'debug' | 'warn' | 'error'

type EvaluateFn = string | ((...args: any[]) => any)

/**
 * Specifies the available options which can be supplied to a step to override global settings.
 *
 * **Example:**
 *
 * ```typescript
 * step("Step 1", { waitTimeout: 300 }, async browser => {
 * 	await browser.click(...)
 * })
 * ```
 *
 * @export
 * @interface StepOptions
 */
export interface StepOptions {
	/**
	 * Timeout in seconds for all wait and navigation operations within this <[step]>.
	 * @default `30` seconds
	 */
	waitTimeout?: number
}

export interface FloodProcessEnv {
	BROWSER_ID: number
	FLOOD_GRID_REGION: string
	FLOOD_GRID_SQEUENCE_ID: number
	FLOOD_GRID_SEQUENCE_ID: number
	FLOOD_GRID_INDEX: number
	FLOOD_GRID_NODE_SEQUENCE_ID: number
	FLOOD_NODE_INDEX: number
	FLOOD_SEQUENCE_ID: number
	FLOOD_PROJECT_ID: number

	/**
	 * Globally unique sequence number for this browser instance.
	 */
	SEQUENCE: number
}

/**
 * A subset of process.env available to this test.
 */
export const ENV: FloodProcessEnv

/**
 * Declares the settings for the test, overriding settings exported at the top of the test.
 *
 * _This is a secondary syntax to `export const settings = {}` which functions exactly the same way.
 *
 * **Example:**
 *
 * ```typescript
 * export default () => {
 *  setup({ waitTimeout: 60 })
 * }
 * ```

 * @export
 * @param {TestSettings} settings
 */
export declare function setup(settings: TestSettings): void
export interface TestDataRow {
	[key: string]: string | number | boolean | null
}

/**
 * Declares each step in your test. This must go within your main test expression.
 *
 * **Example:**
 *
 * ```typescript
 * export default () => {
 *   step("Step 1", async browser => {
 *     await browser.visit("https://example.com")
 *   })
 *
 *   step("Step 2", async browser => {})
 *
 *   step("Step 3", async browser => {})
 * }
 * ```
 *
 * @export
 * @param {string} name Step Name
 * @param {(driver: Driver) => Promise<void>} fn Actual implementation of step
 */
export declare function step(name: string, fn: StepFunction<any>): void
export declare function step(
	name: string,
	options: StepOptions,
	fn: StepFunction<any>,
): void

/**
 * The standard interface for defining the callback for a <[step]>.
 */
export type StepFunction<T> = (
	this: null,
	browser: Driver,
	data?: T,
) => Promise<void>

/**
 * Use this to load test data which will be iterated over with each iteration of your test.
 *
 * @export
 * @class TestData
 * @template T
 */
export declare class TestData<T> {
	/**
	 * Loads a standard Javascript array of data objects
	 */
	public static fromData<TRow>(lines: TRow[]): TestData<TRow>

	/**
	 * Loads test data from a CSV file, returning a `TestData` instance.
	 */
	public static fromCSV<T>(
		// filename to load, based on what you upload to Flood. All test files are in the current path.
		filename: string,
		// Specify a different separator
		seperator?: string,
	): TestData<T>

	/**
	 * Loads data from a JSON ffile
	 */
	public static fromJSON<TRow>(filename: string): TestData<TRow>

	/**
	 * Instructs the data feeder to repeat the data set when it reaches the end.
	 * @param circular optional, pass `false` to disable
	 */
	public circular(circular?: boolean): this

	/**
	 * Shuffles the data set using the Fisher-Yates method. Use this to randomise the order of your data. This will always be applied after filtering.
	 * @param shuffle optional, pass `false` to disable
	 */
	public shuffle(shuffle?: boolean): this

	/**
	 * Adds a filter to apply against each line in the data set.
	 *
	 * Filters can be chained, and will be run in order only if the previous ffilter passed.
	 *
	 * Example:
	 * 	```
	 * 		type Row = { browser: string, email: string }
	 * 		TestData.fromCSV("users.csv").filter((line, index, browserID) => line.browser === browserID)
	 *  ```
	 *
	 * @param func filter function to compare each line
	 */
	public filter(func: FeedFilterFunction<T>): this
}

/**
 * FeedFilterFunction behaves exactly like the standard Javascript `Array.prototype.filter`, except that is supplies a 3rd argument which is set to the browser index on this grid.
 */
export type FeedFilterFunction<T> = (
	line: T,
	index: number,
	instanceID: string,
) => boolean


export type StepDefinition<T> = (
	name: string,
	fn: StepFunction<T>,
) => PromiseLike<any>

/**
 * Defines a test suite of steps to run.
 *
 * **Example:**
 * ```
 *   export default suite(step => {
 *     step("Step 1", async browser => {
 *       await browser.visit('...')
 *     })
 *   })
 * ```
 *
 * @param testDefinition
 */
declare const suite: Flood.ISuiteDefinition

export namespace Flood {
	interface ISuiteDefinition {
		(callback: (this: null, step: StepDefinition<null>) => void)
		withData<T>(
			data: TestData<T>,
			callback: (this: null, step: StepDefinition<T>) => void,
		)
	}
}


/**
 * Browser (also called Driver) is the main entry point in each <[step]>, it's your direct connection to the browser running the test.
 *
 * ```typescript
 * import { step } from "@flood/chrome"
 * export default () => {
 *   step("Start", async browser => {
 *     await browser.visit("https://challenge.flood.io")
 *   })
 * }
 * ```
 *
 */
export declare class Browser {
	/**
	 * Sets the HTTP Authentication details to use if the page is presented with an authentication prompt.
	 *
	 * Call without any args to disable authentication.
	 */
	public authenticate(username?: string, password?: string): Promise<void>

	/**
	 * Clear browser cookies.
	 */
	public clearBrowserCookies(): Promise<any>

	/**
	 * Clear browser cache.
	 */
	public clearBrowserCache(): Promise<any>

	/**
	 * Configure Browser to emulate a given device
	 */
	public emulateDevice(deviceName: Device): Promise<void>

	/**
	 * Set Browser to send a custom User Agent (UA) string
	 */
	public setUserAgent(userAgent: string): Promise<void>

	/**
	 * Instructs the browser to navigate to a specific page. This is typically used as the
	 * entrypoint to your test, as the first instruction it is also responsible for creating
	 * a new Browser tab for this page to load into.
	 *
	 * **Example:**
	 *
	 * ```typescript
	 * step("Start", async browser => {
	 *   await browser.visit("https://example.com")
	 * })
	 * ```
	 *
	 * @param {string} url
	 * @returns {Promise<void>}
	 * @memberof Driver
	 */
	public visit(url: string, options?: NavigationOptions): Promise<void>

	/**
	 * Creates a waiter which will pause the test until a condition is met or a timeout is reached. This can be used for validation or control flow.
	 *
	 * **Example:**
	 *
	 * ```typescript
	 * step("Start", async browser => {
	 *   await browser.wait(Until.elementIsVisible(By.css('h1.title')))
	 * })
	 * ```
	 *
	 * You can use either a numeric value in seconds to wait for a specific time,
	 * or a <[Condition]>, for more flexible conditions.
	 */
	public wait(timeoutOrCondition: Condition | number): Promise<boolean>

	public evaluate(fn: EvaluateFn, ...args: any[]): Promise<any>

	/**
	 * Sends a click event to the element located at `selector`. If the element is
	 * currently outside the viewport it will first scroll to that element.
	 *
	 * **Example:**
	 *
	 * ```typescript
	 * step("Start", async browser => {
	 *   await browser.click(By.partialLinkText('Start'))
	 * })
	 * ```
	 *
	 * In this example we're constructing a <[Locatable]> using the `By.partialLinkText()` Locator, which will match the first `<a>` tag which contains the text "Start".
	 *
	 */
	public click(locatable: Locatable, options?: ClickOptions): Promise<void>

	/**
	 * Sends a double-click event to the element located by the supplied Locator or `selector`. If the element is
	 * currently outside the viewport it will first scroll to that element.
	 */
	public doubleClick(
		locatable: Locatable,
		options?: ClickOptions,
	): Promise<void>

	/**
	 * Selects an option within a `<select>` tag using the value of the `<option>` element.
	 */
	public selectByValue(
		locatable: Locatable,
		...values: string[]
	): Promise<string[]>

	/**
	 * Selects an option within a `<select>` tag by its index in the list.
	 */
	public selectByIndex(locatable: Locatable, index: string): Promise<string[]>

	/**
	 * Selects an option within a `<select>` tag by matching its visible text.
	 */
	public selectByText(locatable: Locatable, text: string): Promise<string[]>

	/**
	 * Clears the selected value of an input or select control.
	 */
	public clear(locatable: Locatable): Promise<void>

	/**
	 * Types a string into an `<input>` control, key press by key press. Use this to fill inputs as though it was typed by the user.
	 *
	 * **Example:**
	 * ```typescript
	 * step("Step 1", async browser => {
	 *   await browser.type(By.css("#email"), "user@example.com")
	 * })
	 * ```
	 *
	 */
	public type(
		locatable: Locatable,
		text: string,
		options?: { delay: number },
	): Promise<void>

	/**
	 * Removes focus from the specified DOM element.
	 *
	 * @param {Locatable} locator
	 * @returns {Promise<void>}
	 * @memberof Driver
	 */
	public blur(locator: Locatable): Promise<void>

	/**
	 * Makes the element located by the first argument the receiver of future input.
	 *
	 * @param {Locatable} locator The <[Locator]> to use to find an element to send focus to.
	 * @returns {Promise<void>}
	 * @memberof Driver
	 */
	public focus(locator: Locatable): Promise<void>

	/**
	 * Presses a key on the keyboard specified by key code. For example, <[Key.ALT]>
	 */
	public press(
		/**
		 * The key code to send.
		 */
		keyCode: string,
		options?: {
			/**
			 * A string of text to type
			 */
			text?: string /**
			 * Delay between key presses, in milliseconds.
			 */
			delay?: number
		},
	): Promise<void>

	/**
	 * Takes a screenshot of the whole page and saves it to the `flood/results` folder with a random sequential name. You can download the archive of your test results at the end of the test to retrieve these screenshots.
	 */
	public takeScreenshot(options?: ScreenshotOptions): Promise<void>

	/**
	 * Uses the provided locator to find the first element it matches, returning an ElementHandle.
	 */
	public findElement(locator: string | Locator): Promise<ElementHandle | null>

	/**
	 * Uses the provided locator to find all elements matching the locator condition, returning an array of ElementHandles
	 */
	public findElements(locator: string | Locator): Promise<ElementHandle[]>

	/**
	 * Switch the focus of the browser to another frame, tab, or window.
	 */
	public switchTo(): TargetLocator
}

export type Driver = Browser

/**
 * Example Handle represents a remote element in the DOM of the browser. It implements useful methods for querying and interacting with this DOM element.
 *
 * All methids on this class are asynchronous and must be used with `await` to wait for the result to fulfill from the browser.
 *
 * @class ElementHandle
 */
declare class ElementHandle {
	/**
	 * Fetches the value of an attribute on this element
	 */
	public getAttribute(key: string): Promise<string | null>

	/**
	 * Sends a click event to the element attached to this handle. If the element is
	 * currently outside the viewport it will first scroll to that element.
	 */
	public click(options?: ClickOptions): Promise<void>

	/**
	 * Schedules a command to clear the value of this element.
	 * This command has no effect if the underlying DOM element is neither a text
	 * INPUT, SELECT, or a TEXTAREA element.
	 */
	public clear(): Promise<void>

	/**
	 * Sends a series of key modifiers to the element.
	 */
	public sendKeys(...keys: (string | Key)[]): Promise<void>

	/**
	 * Sends a series of key presses to the element to simulate a user typing on the keyboard. Use this to fill in input fields.
	 */
	public type(text: string): Promise<void>

	/**
	 * Sends focus to this element so that it receives keyboard inputs.
	 */
	public focus(): Promise<void>

	/**
	 * Clears focus from this element so that it will no longer receive keyboard inputs.
	 */
	public blur(): Promise<void>

	/**
	 * Takes a screenshot of this element and saves it to the results folder with a random name.
	 */
	public takeScreenshot(options?: ScreenshotOptions): Promise<void>

	/**
	 * Locates an element using the supplied <[Locator]>, returning an <[ElementHandle]>
	 */
	public findElement(locator: string | Locator): Promise<ElementHandle | null>

	/**
	 * Locates all elements using the supplied <[Locator]>, returning an array of <[ElementHandle]>'s
	 */
	public findElements(locator: Locator | string): Promise<ElementHandle[]>

	/**
	 * Fetches the remote elements `tagName` property.
	 */
	public tagName(): Promise<string | null>

	/**
	 * Fetches the remote elements `id` attribute.
	 */
	public getId(): Promise<string | null>

	/**
	 * If the remote element is selectable (such as an `<option>` or `input[type="checkbox"]`) this methos will indicate whether it is selected.
	 */
	public isSelected(): Promise<boolean>

	/**
	 * Checks whether the remote element is selectable. An element is selectable if it is an `<option>` or `input[type="checkbox"]` or radio button.
	 */
	public isSelectable(): Promise<boolean>

	/**
	 * Checks whether the remote element is displayed in the DOM and is visible to the user without being hidden by CSS or occluded by another element.
	 */
	public isDisplayed(): Promise<boolean>

	/**
	 * Checks whether the remote element is enabled. Typically this means it does not have a `disabled` property or attribute applied.
	 */
	public isEnabled(): Promise<boolean>

	/**
	 * Retrieves the text content of this element excluding leading and trailing whitespace.
	 */
	public text(): Promise<string>

	/**
	 * Fetches the remote elements physical dimensions as `width` and `height`.
	 */
	public size(): Promise<{ width: number; height: number }>

	/**
	 * Fetches the remote elements physical location as `x` and `y`.
	 */
	public location(): Promise<{ x: number; y: number }>
}

/**
 * The target locator is accessed through `browser.switchTo()` and enables you to switch frames, tabs, or browser windows. As well as access the `activeElement` or an alert box.
 *
 * @class TargetLocator
 */
declare class TargetLocator {
	/**
	 * Locates the DOM element on the current page that corresponds to
	 * `document.activeElement` or `document.body` if the active element is not
	 * available.
	 */
	public activeElement(): Promise<ElementHandle | null>

	/**
	 * Navigates to the topmost frame
	 */
	public defaultContent(): Promise<void>

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
	public frame(id: number | string | ElementHandle): Promise<void>
}

/**
 * A Condition represents a predicate which can be used to wait for an <[ElementHandle]>.
 *
 * @class Condition
 */
declare class Condition {}

/**
 * A Locator is a generic class constructed from a <[By]> method which can be used to find an Element or Elements on a page.
 *
 * @class Locator
 */
declare class Locator {}

/**
 * By is used to create <[Locator]>'s to find Elements or use in any place which accepts a Locator or <[Locatable]>.
 *
 * @class By
 */
declare class By {
	/**
	 * Locates an element using a CSS (jQuery) style selector
	 * @param selector
	 */
	static css(selector: string): Locator

	/**
	 * Finds an element by ID
	 * @param id
	 */
	static id(id: string): Locator

	/**
	 * Recives a function which runs on the page and returns an element or elements.
	 * @param func
	 */
	static js(func: () => ElementHandle): Locator

	/**
	 * Locates a link containing the specified text.
	 * @param text
	 */
	static linkText(text: string): Locator

	/**
	 * Locates a link (`<a>` tag) containing some of the specified text.
	 *
	 * **Example:**
	 * ```typescript
	 * await browser.findElement(By.partialLinkText("Checkout"))
	 * ```
	 *
	 * @param text
	 */
	static partialLinkText(text: string): Locator

	/**
	 * Locates all elements whose `textContent` equals the given substring and is not hidden by CSS.
	 *
	 * This selector works in multiple stages, by first finding the element matching the text predicate, and then testing whether it is visible ion the viewport and is not occluded by another element or style property.
	 *
	 * @param {string} text The string to check for in a elements's visible text.
	 */
	static visibleText(text: string): Locator

	/**
	 * Locates all elements whose `textContent` contains the given
	 * substring and is not hidden by CSS.
	 *
	 * @param {string} text The substring to check for in a elements's visible text.
	 */
	static partialVisibleText(text: string): Locator

	/**
	 * Locates elements whose `name` attribute has the given value.
	 *
	 * @param {string} value The name attribute to search for.
	 * @return {!By} The new locator.
	 */
	static nameAttr(value: string): Locator

	/**
	 * Finds an element containing a specified attribute value
	 * @param tagName TagName to scope selection to
	 * @param attributeName The attribute to search for
	 * @param value Optional attribute value to compare
	 */
	static attr(tagName: string, attributeName: string, value?: string): Locator

	/**
	 * Locates an element using an XPath expression
	 * @param path XPath selector
	 */
	static xpath(path: string): Locator
}

/**
 * Until is used to create wait <[Conditions]> which are used to wait for elements to become active, visible, invisible or disabled on the page.
 *
 * You would typically use these to control the flow of you test.
 *
 * @class Until
 */
declare class Until {
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
	static ableToSwitchToFrame(frame: string | number | Locatable): Condition

	/**
	 * Creates a condition that waits for an alert to be opened. Upon success, the returned promise will be fulfilled with the handle for the opened alert
	 * @param alertText
	 */
	static alertIsPresent(alertText: string): Condition

	/**
	 * Creates a condition that will wait for the given element to be disabled
	 * @param selectorOrLocator A <[Locatable]> to use to find the element.
	 */
	static elementIsDisabled(locatable: Locatable): Condition

	/**
	 * Creates a condition that will wait for the given element to be enabled
	 * @param selectorOrLocator A <[Locatable]> to use to find the element.
	 */
	static elementIsEnabled(locatable: Locatable): Condition

	/**
	 * Creates a condition that will wait for the given element to be deselected.
	 * @param selectorOrLocator A <[Locatable]> to use to find the element.
	 */
	static elementIsSelected(locatable: Locatable): Condition

	/**
	 * Creates a condition that will wait for the given element to be in the DOM, yet not visible to the user
	 * @param selectorOrLocator A <[Locatable]> to use to find the element.
	 */
	static elementIsNotSelected(locatable: Locatable): Condition

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
	static elementIsVisible(locatable: Locatable): Condition

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
	static elementIsNotVisible(locatable: Locatable): Condition

	/**
	 * Creates a condition which will wait until the element is located on the page.
	 */
	static elementLocated(locatable: Locatable): Condition

	/**
	 * Creates a condition which will wait until the element's text content contains the target text.
	 */
	static elementTextContains(locatable: Locatable, text: string): Condition

	/**
	 * Creates a condition which will wait until the element's text exactly matches the target text, excluding leading and trailing whitespace.
	 */
	static elementTextIs(locatable: Locatable, text: string): Condition

	/**
	 * Creates a condition which will wait until the element's text matches the target Regular Expression.
	 */
	static elementTextMatches(locatable: Locatable, regex: RegExp): Condition

	/**
	 * Creates a condition that will loop until at least one element is found with the given locator.
	 */
	static elementsLocated(selectorOrLocator: Locator | string): Condition

	/**
	 * Creates a condition that will wait for the given element to become stale.
	 *
	 * An element is considered stale once it is removed from the DOM, or a new page has loaded.
	 */
	static stalenessOf(selectorOrLocator: Locator | string): Condition

	/**
	 * Creates a condition which waits until the page title contains the expected text.
	 */
	static titleContains(title: string): Condition

	/**
	 * Creates a condition which waits until the page title exactly matches the expected text.
	 */
	static titleIs(title: string): Condition

	/**
	 * Creates a condition which waits until the page title matches the title `RegExp`.
	 */
	static titleMatches(title: RegExp): Condition

	/**
	 * Creates a condition which waits until the page URL contains the expected path.
	 */
	static urlContains(url: string): Condition

	/**
	 * Creates a condition which waits until the page URL exactly matches the expected URL.
	 */
	static urlIs(url: string): Condition

	/**
	 * Creates a condition which waits until the page URL matches the supplied `RegExp`.
	 */
	static urlMatches(url: RegExp): Condition
}

/**
 * Locatable is the default type to use in place of a <[Locator]>. It can be a Locator or a CSS selector string.
 */
export type Locatable = Locator | string

/**
 * Lists all available keyboard control keys which can be used when sending a key press combination.
 *
 * @export
 * @enum {number}
 */

export enum Key {
	NULL = '\uE000',
	CANCEL = '\uE001', // ^break
	HELP = '\uE002',
	BACK_SPACE = '\uE003',
	TAB = '\uE004',
	CLEAR = '\uE005',
	RETURN = '\uE006',
	ENTER = '\uE007',
	SHIFT = '\uE008',
	CONTROL = '\uE009',
	ALT = '\uE00A',
	PAUSE = '\uE00B',
	ESCAPE = '\uE00C',
	SPACE = '\uE00D',
	PAGE_UP = '\uE00E',
	PAGE_DOWN = '\uE00F',
	END = '\uE010',
	HOME = '\uE011',
	ARROW_LEFT = '\uE012',
	LEFT = '\uE012',
	ARROW_UP = '\uE013',
	UP = '\uE013',
	ARROW_RIGHT = '\uE014',
	RIGHT = '\uE014',
	ARROW_DOWN = '\uE015',
	DOWN = '\uE015',
	INSERT = '\uE016',
	DELETE = '\uE017',
	SEMICOLON = '\uE018',
	EQUALS = '\uE019',

	NUMPAD0 = '\uE01A', // number pad keys
	NUMPAD1 = '\uE01B',
	NUMPAD2 = '\uE01C',
	NUMPAD3 = '\uE01D',
	NUMPAD4 = '\uE01E',
	NUMPAD5 = '\uE01F',
	NUMPAD6 = '\uE020',
	NUMPAD7 = '\uE021',
	NUMPAD8 = '\uE022',
	NUMPAD9 = '\uE023',
	MULTIPLY = '\uE024',
	ADD = '\uE025',
	SEPARATOR = '\uE026',
	SUBTRACT = '\uE027',
	DECIMAL = '\uE028',
	DIVIDE = '\uE029',

	F1 = '\uE031', // function keys
	F2 = '\uE032',
	F3 = '\uE033',
	F4 = '\uE034',
	F5 = '\uE035',
	F6 = '\uE036',
	F7 = '\uE037',
	F8 = '\uE038',
	F9 = '\uE039',
	F10 = '\uE03A',
	F11 = '\uE03B',
	F12 = '\uE03C',

	COMMAND = '\uE03D', // Apple command key
	META = '\uE03D', // alias for Windows key
}

/**
 * This interface represents the available options to pass to <[Driver]>.visit()
 */
export interface NavigationOptions {
	/**
	 * Maximum navigation time in milliseconds, pass 0 to disable timeout.
	 * @default 30000
	 */
	timeout?: number
	/**
	 * When to consider navigation succeeded.
	 * @default load Navigation is consider when the `load` event is fired.
	 */
	waitUntil?: 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2'
}

/**
 * Specifies the available mouse buttons to use when clicking. The default is always `left`
 */
export enum MouseButtons {
	// Left mouse button
	LEFT = 'left',

	// Right mouse button
	RIGHT = 'right',

	/**
	 * Middle mouse button
	 */
	MIDDLE = 'middle',
}

/**
 * Specifies the available options to send when clicking to modify the click behaviour. For example, to send a double click, set `clickCount: 2`.
 *
 * @export
 * @interface ClickOptions
 */
export interface ClickOptions {
	/** defaults to left */
	button?: MouseButtons
	/** defaults to 1 */
	clickCount?: number
	/**
	 * Time to wait between mousedown and mouseup in milliseconds.
	 * Defaults to 0.
	 */
	delay?: number
}

/** Defines the screenshot options. */
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

/**
 * Chrome DevTools Device Emulation
 */
export enum Device {
	'blackberryPlayBook' = 'Blackberry PlayBook',
	'blackberryPlayBookLandscape' = 'Blackberry PlayBook landscape',
	'blackBerryZ30' = 'BlackBerry Z30',
	'blackBerryZ30Landscape' = 'BlackBerry Z30 landscape',
	'galaxyNote_3' = 'Galaxy Note 3',
	'galaxyNote_3Landscape' = 'Galaxy Note 3 landscape',
	'galaxyNoteIi' = 'Galaxy Note II',
	'galaxyNoteIiLandscape' = 'Galaxy Note II landscape',
	'galaxySIii' = 'Galaxy S III',
	'galaxySIiiLandscape' = 'Galaxy S III landscape',
	'galaxyS5' = 'Galaxy S5',
	'galaxyS5Landscape' = 'Galaxy S5 landscape',
	'iPad' = 'iPad',
	'iPadLandscape' = 'iPad landscape',
	'iPadMini' = 'iPad Mini',
	'iPadMiniLandscape' = 'iPad Mini landscape',
	'iPadPro' = 'iPad Pro',
	'iPadProLandscape' = 'iPad Pro landscape',
	'iPhone4' = 'iPhone 4',
	'iPhone4Landscape' = 'iPhone 4 landscape',
	'iPhone5' = 'iPhone 5',
	'iPhone5Landscape' = 'iPhone 5 landscape',
	'iPhone6' = 'iPhone 6',
	'iPhone6Landscape' = 'iPhone 6 landscape',
	'iPhone6Plus' = 'iPhone 6 Plus',
	'iPhone6PlusLandscape' = 'iPhone 6 Plus landscape',
	'iPhoneX' = 'iPhone X',
	'iPhoneXLandscape' = 'iPhone X landscape',
	'kindleFireHdx' = 'Kindle Fire HDX',
	'kindleFireHdxLandscape' = 'Kindle Fire HDX landscape',
	'lgOptimusL70' = 'LG Optimus L70',
	'lgOptimusL70Landscape' = 'LG Optimus L70 landscape',
	'microsoftLumia550' = 'Microsoft Lumia 550',
	'microsoftLumia950' = 'Microsoft Lumia 950',
	'microsoftLumia950Landscape' = 'Microsoft Lumia 950 landscape',
	'nexus10' = 'Nexus 10',
	'nexus10Landscape' = 'Nexus 10 landscape',
	'nexus4' = 'Nexus 4',
	'nexus4Landscape' = 'Nexus 4 landscape',
	'nexus5' = 'Nexus 5',
	'nexus5Landscape' = 'Nexus 5 landscape',
	'nexus5X' = 'Nexus 5X',
	'nexus5XLandscape' = 'Nexus 5X landscape',
	'nexus6' = 'Nexus 6',
	'nexus6Landscape' = 'Nexus 6 landscape',
	'nexus6P' = 'Nexus 6P',
	'nexus6PLandscape' = 'Nexus 6P landscape',
	'nexus7' = 'Nexus 7',
	'nexus7Landscape' = 'Nexus 7 landscape',
	'nokiaLumia_520' = 'Nokia Lumia 520',
	'nokiaLumia_520Landscape' = 'Nokia Lumia 520 landscape',
	'nokiaN9' = 'Nokia N9',
	'nokiaN9Landscape' = 'Nokia N9 landscape',
}
