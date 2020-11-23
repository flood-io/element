import CustomDeviceDescriptors from '../utils/CustomDeviceDescriptors'
import { Viewport } from 'puppeteer'
import ms from 'ms'

/**
 * Declares the settings for the test, overriding the settings constant exported in the test script.
 *
 * _This is a secondary syntax for `export const settings = {}` which functions exactly the same way._
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

// Waits is milliseconds
export const DEFAULT_STEP_WAIT_MILLISECONDS = 5000
export const DEFAULT_ACTION_WAIT_MILLISECONDS = 500
export const DEFAULT_WAIT_TIMEOUT_MILLISECONDS = 30000
export const DEFAULT_ACTION_DELAY = 2000
export const DEFAULT_STEP_DELAY = 6000
export const DEFAULT_DURATION = 0
export const DEFAULT_STEP_DELAY_FAST_FORWARD = 1000
export const DEFAULT_ACTION_DELAY_FAST_FORWARD = 1000
export const DEFAULT_STEP_DELAY_SLOW_MO = 10000
export const DEFAULT_ACTION_DELAY_SLOW_MO = 10000

/**
 * Specifies a method for recording response times.
 *
 * literal | description
 * --------|------------
 * step | (Default) Records the wall clock time of a step. This is useful for Single Page Application which don't actually trigger a navigation.
 * page | Record the document loading response time. This is usually what you consider response time on paged web apps.
 * network | (Experimental) Takes the mean response time of all network requests which occur during a step. This is useful for Single Page Application which don't actually trigger a navigation.
 * stepWithThinkTime | `"stepWithThinkTime"`: Records the wall clock time of a step including `actionDelay` time.
 */
export type ResponseTiming = 'page' | 'network' | 'step' | 'stepWithThinkTime'

/**
 * Specifies a `console` method
 */
export type ConsoleMethod = 'log' | 'info' | 'debug' | 'warn' | 'error'

/**
 * Represents the versions of chrome that the test script will run against.
 *
 * literal | description
 * --------|-----------
 * puppeteer | (Default) The browser bundled with [puppeteer]. It is a curated version of [chromium](https://www.chromium.org) (the open source version of Google Chrome). Using the puppeteer-bundled Chromium ensures the best compatibility with puppeteer, but lacks some features such as video support.
 * stable | The latest version of [Google Chrome](https://www.chromium.org/). Google Chrome has more features than chromium, but isn't tested as thoroughly against puppeteer, which can result in intermittent errors. If you don't need the extra features, please use `bundled`.
 */
export type ChromeVersion = 'puppeteer' | 'stable'

/**
 * Element presence lists the accepted values for automatically waiting on elements before running actions.
 *
 * - visible: waits until the element is visible on the page and is painted
 * - present: only checks for presence in the DOM
 * - ready: waits until the element is painted and not disabled
 *
 * Set to `false` or `null` to disable.
 */
export type ElementPresence = 'visible' | 'present' | 'ready' | false | null

/**
 * The TestSettings interface specifies the available settings you have to configure how your test runs. These properties should be exported using the property `settings`.
 *
 * **Example:**
 *
 * ```typescript
 * export const settings: TestSettings = {
 *   loopCount: Infinity,
 *   clearCache: true
 * }
 * ```
 *
 * See [DEFAULT_SETTINGS] for a list of the default value for each setting.
 */

export interface TestSettings {
	/**
	 * Maximum duration to run the test for.
	 *
	 * Note that when running a load test via https://flood.io, the duration of the load test takes precedence over this setting.
	 *
	 * Defaults to `-1` for no timeout.
	 */
	duration?: string | number

	/**
	 * Number of times to run this test.
	 *
	 * Defaults to `-1` for an unlimited number of loops.
	 */
	loopCount?: number

	/**
	 * Specifies the time (in seconds) to wait between each action call.
	 *
	 * Waiting between actions simulates the behaviour of a real user as they read, think and act on the page's content.
	 */
	actionDelay?: string | number

	/**
	 * Specifies the time (in seconds) to wait after each step.
	 */
	stepDelay?: string | number

	/**
	 * Specifies a custom User Agent (UA) string to send.
	 */
	userAgent?: string

	/**
	 * Specifies a device to emulate with browser device emulation.
	 */
	device?: string | null

	/**
	 * Sets the viewport of the page.
	 * @param viewport The viewport parameters.
	 */
	viewport?: Viewport | null

	/**
	 * Global wait timeout applied to all wait tasks.
	 */
	waitTimeout?: number | string

	/**
	 * Specifies whether cookies should be cleared after each test loop.
	 *
	 * @default true
	 */
	clearCookies?: boolean

	/**
	 * Specifies whether Browser cache should be cleared after each test loop.
	 *
	 * @default false
	 */
	clearCache?: boolean

	/**
	 * Disables browser request cache for all requests.
	 */
	disableCache?: boolean

	/**
	 * Specifies a set of extra HTTP headers to set before each test loop.
	 * If this setting is undefined, the extra HTTP headers are left as-is between iterations.
	 *
	 * @default {}
	 */
	extraHTTPHeaders?: { [key: string]: string }

	/**
	 * Speicifies the name of the test specified in the comments section
	 *
	 * @default "Element Test"
	 */
	name?: string

	/**
	 * Speicifies the description of the test specified in the comments section
	 *
	 * @default ""
	 */
	description?: string

	/**
	 * Take a screenshot of the page when a command fails, to aid in debugging.
	 *
	 * Screenshots are saved to `/flood/result/screenshots` in the test archive.
	 */
	screenshotOnFailure?: boolean

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
	 * Specify which console methods to filter out. By default no console methods are filtered.
	 *
	 * This setting can be useful for very noisy tests. When a method is filtered, it still works as normal but the message will be omitted from the Element output.
	 */
	consoleFilter?: ConsoleMethod[]

	/**
	 * Whether to ignore HTTPS errors during navigation. Defaults to `false`
	 */
	ignoreHTTPSErrors?: boolean

	/**
	 * Controls whether each iteration should run within an Incognito window instead of a normal
	 * window. The Incognito session will be destroyed between each loop.
	 */
	incognito?: boolean

	/**
	 * Specifies a version of Google Chrome
	 */
	chromeVersion?: ChromeVersion

	/**

	 * Blocks requests to a list a domains. Accepts partial matches using `*` or any matcher accepted by [Micromatch](https://github.com/micromatch/micromatch)
	 *
	 * Matching is applied to the `hostname` only, unless the blocked domain contains a `:` in which case it will match against `hostname` and `port`.
	 *
	 * Example:
	 *
	 * `["*.google-analytics.com", "*:1337"]`
	 */
	blockedDomains?: string[]

	/**
	 * Automatically apply a wait(Until...) before each action. Defaults to `false`
	 *
	 * Accepts either `visible` or `present` as values. Set to `false` to disable (default).
	 *
	 * Uses global wait timeout from settings.
	 */
	waitUntil?: ElementPresence

	/**
	 * Additional arguments to pass to the browser instance.
	 * The list of Chromium flags can be found at https://peter.sh/experiments/chromium-command-line-switches/
	 */
	launchArgs?: string[]

	/**
	 * Define the loop count of the recovery step
	 */
	tries?: number
}

/**
 * The default settings for a Test. Any settings you provide are merged into these defaults.
 */
export const DEFAULT_SETTINGS: ConcreteTestSettings = {
	waitUntil: false,
	duration: -1,
	loopCount: Infinity,
	actionDelay: DEFAULT_ACTION_DELAY,
	stepDelay: DEFAULT_STEP_DELAY,
	screenshotOnFailure: true,
	clearCookies: true,
	clearCache: false,
	waitTimeout: DEFAULT_WAIT_TIMEOUT_MILLISECONDS,
	responseTimeMeasurement: 'step',
	tries: 0,
	/**
	 * by default, don't filter any console messages from the browser
	 */
	consoleFilter: [],
	userAgent: CustomDeviceDescriptors['Chrome Desktop Large'].userAgent,
	device: 'Chrome Desktop Large',
	ignoreHTTPSErrors: false,
	chromeVersion: 'puppeteer',
	blockedDomains: [],
	incognito: false,
	name: 'Element Test',
	description: '',
	disableCache: false,
	extraHTTPHeaders: {},
	launchArgs: [],
	viewport: null,
}

/**
 * ConcreteTestSettings represents the minimal set of mandatory settings for a Test to run.
 *
 * Users provide settings in their script via <TestSettings>, which is ultimately merged with DEFAULT_SETTINGS to yield ConcreteTestSettings.
 *
 * From the Test's perspective, this means that `undefined` checking is front-loaded and  we can simply use settings as-is without having to check values for definedness.
 *
 * @internal
 */
export type ConcreteTestSettings = Required<TestSettings>

/**
 * @internal
 */
export function normalizeSettings(settings: TestSettings): TestSettings {
	let convertedWaitTimeout = DEFAULT_WAIT_TIMEOUT_MILLISECONDS
	let convertedActionDelay = DEFAULT_ACTION_DELAY
	let convertedStepDelay = DEFAULT_STEP_DELAY
	let convertedDuration = DEFAULT_DURATION

	if (settings.waitTimeout) {
		if (typeof settings.waitTimeout === 'string') {
			// support new string value for `waitTimeout`, still keep the raw value
			convertedWaitTimeout = ms(settings.waitTimeout)
		} else {
			// legacy code
			convertedWaitTimeout = settings.waitTimeout
			if (convertedWaitTimeout < 0) convertedWaitTimeout = DEFAULT_WAIT_TIMEOUT_MILLISECONDS
			if (convertedWaitTimeout < 1e3) convertedWaitTimeout *= 1e3
		}
	}
	settings.waitTimeout = convertedWaitTimeout

	if (settings.actionDelay) {
		if (typeof settings.actionDelay === 'string') {
			convertedActionDelay = ms(settings.actionDelay)
		} else {
			convertedActionDelay = settings.actionDelay
			if (convertedActionDelay < 0) convertedActionDelay = DEFAULT_ACTION_DELAY
			if (convertedActionDelay < 1e3) convertedActionDelay *= 1e3
		}
	}
	settings.actionDelay = convertedActionDelay

	if (settings.stepDelay) {
		if (typeof settings.stepDelay === 'string') {
			convertedStepDelay = ms(settings.stepDelay)
		} else {
			convertedStepDelay = settings.stepDelay
			if (convertedStepDelay < 0) convertedStepDelay = DEFAULT_STEP_DELAY
			if (convertedStepDelay < 1e3) convertedStepDelay *= 1e3
		}
	}
	settings.stepDelay = convertedStepDelay

	if (settings.duration) {
		if (typeof settings.duration === 'string') {
			convertedDuration = ms(settings.duration)
		} else {
			convertedDuration = settings.duration
		}
		settings.duration = convertedDuration
	}

	return settings
}
