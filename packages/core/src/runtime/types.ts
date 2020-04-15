import { Device } from '../page/Enums'
import { Condition } from '../page/Condition'
import {
	NavigationOptions,
	ClickOptions,
	ScreenshotOptions,
	Page,
	Frame,
	Viewport,
} from 'puppeteer'
import { ElementHandle, Locator } from '../page/types'
import { TargetLocator } from '../page/TargetLocator'
import { StepDefinition } from './Step'
import { TestDataSource } from '../test-data/TestData'
import Mouse from '../page/Mouse'
import { TestSettings } from './Settings'

export { NavigationOptions }

/**
 * EvaluateFn represents a function which can be evaluated on the browser.
 * It can either be a [string] or a function.
 */
export type EvaluateFn = string | ((...args: any[]) => any)

/**
 * Locatable represents anything able to be located, either a string selector or a <[Locator]>. <[Locator]>s are generally created using <[By]> methods.
 */
export type Locatable = Locator | ElementHandle | string

/**
 * NullableLocatable represents a <[Locatable]> which could also be null.
 *
 * Note that most Element location API methods accept a NullableLocatable but will throw an <[Error]> if its actually <[null]>.
 */
export type NullableLocatable = Locatable | null

/**
 * Defines a test suite of steps to run.
 *
 * **Example:**
 * ```
 *   import { TestData } from '@flood/element'
 *   interface Row {
 *     user: string
 *     systemID: number
 *   }
 *   const testData = TestData.withCSV<Row>(...)
 *
 *   export default suite.withData((testData, step) => {
 *     step("Step 1", async (row: Row, browser: Browser) => {
 *       await browser.visit(`http://example.com/user-${row.systemID}.html`)
 *     })
 *   })
 * ```
 *
 * @param testDefinition
 */
export declare const suite: SuiteDefinition

export interface SuiteDefinition {
	(callback: (this: null, s: StepDefinition<null>) => void): void
	withData<T>(
		data: TestDataSource<T>,
		callback: (this: null, step: StepDefinition<T>) => void,
	): void
}

/**
 * Browser is the main entry point in each <[step]>, it's your direct connection to the browser running the test.
 *
 * ```typescript
 * import { step } from "@flood/element"
 * export default () => {
 *   step("Start", async browser => {
 *     await browser.visit("https://challenge.flood.io")
 *   })
 * }
 * ```
 *
 */
export interface Browser {
	settings: TestSettings

	/**
	 * @internal
	 * @private
	 */
	beforeFunc: (b: Browser, name: string) => Promise<void>

	/**
	 * @internal
	 * @private
	 */
	afterFunc: (b: Browser, name: string) => Promise<void>

	title(): Promise<string>

	/**
	 * The current puppeteer Page
	 */
	page: Page

	/**
	 * The list of puppeteer Frames
	 */
	frames: Frame[]

	/**
	 * Sets the HTTP Authentication details to use if the page is presented with an authentication prompt.
	 *
	 * Call without any args to disable authentication.
	 */
	authenticate(username?: string, password?: string): Promise<void>

	/**
	 * Clear browser cookies.
	 */
	clearBrowserCookies(): Promise<any>

	/**
	 * Clear browser cache.
	 */
	clearBrowserCache(): Promise<any>

	/**
	 * Configure Browser to emulate a given device
	 */
	emulateDevice(deviceName: Device): Promise<void>

	/**
	 * Set Browser to send a custom User Agent (UA) string
	 */
	setUserAgent(userAgent: string): Promise<void>

	setExtraHTTPHeaders(headers: { [key: string]: string }): Promise<void>

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
	 * @param url  url to visit
	 * @param options  puppeteer navigation options
	 */
	visit(url: string, options?: NavigationOptions): Promise<void>

	/**
	 * Creates a waiter which will pause the test until a condition is met or a timeout is reached. This can be used for validation or control flow.
	 *
	 * Check out <[Until]> for a rich set of wait <[Condition]>s.
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
	wait(timeoutOrCondition: Condition | number): Promise<boolean>

	waitForNavigation(): Promise<any>

	evaluate(fn: EvaluateFn, ...args: any[]): Promise<any>

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
	click(locatable: NullableLocatable, options?: ClickOptions): Promise<void>

	/**
	 * Sends a double-click event to the element located by the supplied Locator or `selector`. If the element is
	 * currently outside the viewport it will first scroll to that element.
	 */
	doubleClick(locatable: NullableLocatable, options?: ClickOptions): Promise<void>

	/**
	 * Selects an option within a `<select>` tag using the value of the `<option>` element.
	 */
	selectByValue(locatable: NullableLocatable, ...values: string[]): Promise<string[]>

	/**
	 * Selects an option within a `<select>` tag by its index in the list.
	 */
	selectByIndex(locatable: NullableLocatable, index: string): Promise<string[]>

	/**
	 * Selects an option within a `<select>` tag by matching its visible text.
	 */
	selectByText(locatable: NullableLocatable, text: string): Promise<string[]>

	/**
	 * Clears the selected value of an input or select control.
	 */
	clear(locatable: NullableLocatable): Promise<void>

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
	type(locatable: NullableLocatable, text: string, options?: { delay: number }): Promise<void>

	/**
	 * Removes focus from the specified DOM element.
	 *
	 * @param  locator
	 * @returns {Promise<void>}
	 * @memberof Driver
	 */
	blur(locator: NullableLocatable): Promise<void>

	/**
	 * Makes the element located by the first argument the receiver of future input.
	 *
	 * @param locator The <[Locator]> to use to find an element to send focus to.
	 * @returns {Promise<void>}
	 * @memberof Driver
	 */
	focus(locator: NullableLocatable): Promise<void>

	/**
	 * Presses a key on the keyboard specified by key code. For example, <[Key.ALT]>
	 */
	press(
		/**
		 * The key code to send.
		 */
		keyCode: string,
		options?: {
			/**
			 * A string of text to type
			 */
			text?: string
			/**
			 * Delay between key presses, in milliseconds.
			 */
			delay?: number
		},
	): Promise<void>

	/**
	 * `sendKeys` simulates typing a list of strings on the keyboard.
	 *
	 * If a string is a member of <[Key]> it is pressed individually. Otherwise the string is typed.
	 * This allows sendKeys to simulate a user typing control keys such as `Key.ENTER`.
	 *
	 * **Example:**
	 * ```typescript
	 * await browser.click("#input_address")
	 * await browser.sendKeys("Hello, World!", Key.ENTER)
	 * ```
	 */
	sendKeys(...keys: string[]): Promise<void>

	/**
	 * The Mouse class operates in main-frame CSS pixels relative to the top-left corner of the viewport.
	 * Every page has its own <[Mouse]>, accessible with `browser.mouse`.
	 */
	mouse: Mouse

	/**
	 * Takes a screenshot of the whole page and saves it to the `flood/results` folder with a random sequential name. You can download the archive of your test results at the end of the test to retrieve these screenshots.
	 */
	takeScreenshot(options?: ScreenshotOptions): Promise<void>

	/**
	 * Highlight an element. Useful in concert with takeScreenshot to tweak your locators.
	 */
	highlightElement(element: ElementHandle): Promise<void>

	/**
	 * Uses the provided locator to find the first element it matches, returning an ElementHandle.
	 */
	maybeFindElement(locator: NullableLocatable): Promise<ElementHandle | null>

	/**
	 * Uses the provided locator to find the first element it matches, returning an ElementHandle.
	 * If no element is found throws an error.
	 */
	findElement(locator: NullableLocatable): Promise<ElementHandle>

	/**
	 * Uses the provided locator to find all elements matching the locator condition, returning an array of ElementHandles
	 */
	findElements(locator: NullableLocatable): Promise<ElementHandle[]>

	/**
	 * Switch the focus of the browser to another frame, tab, or window.
	 */
	switchTo(): TargetLocator

	setViewport(viewport: Viewport): Promise<void>

	getNodeJSProcessEnv(): NodeJS.ProcessEnv
}

/**
 * Driver is an alias to Browser. Please use Browser when possible.
 */
export type Driver = Browser
