import CustomDeviceDescriptors from '../utils/CustomDeviceDescriptors'

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

// Waits is seconds
export const DEFAULT_STEP_WAIT_SECONDS = 5
export const DEFAULT_ACTION_WAIT_SECONDS = 0.5

/**
 * Specifies an option for how to record response time.
 */
export type ResponseTiming =
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
export type ConsoleMethod = 'log' | 'info' | 'debug' | 'warn' | 'error'

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
// TODO provide ConcreteTestSettings
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

export interface ConcreteTestSettings extends TestSettings {
	duration: number
	loopCount: number
	actionDelay: number
	stepDelay: number
	screenshotOnFailure: boolean
	clearCookies: boolean
	clearCache: boolean
	waitTimeout: number
	responseTimeMeasurement: ResponseTiming
	consoleFilter: ConsoleMethod[]
	userAgent: string
	device: string
	ignoreHTTPSErrors: boolean
}

export const DEFAULT_SETTINGS: ConcreteTestSettings = {
	duration: -1,
	loopCount: Infinity,
	actionDelay: 2,
	stepDelay: 6,
	screenshotOnFailure: true,
	clearCookies: true,
	clearCache: false,
	waitTimeout: 30,
	responseTimeMeasurement: 'step',
	consoleFilter: [],
	userAgent: CustomDeviceDescriptors['Chrome Desktop Large'].userAgent,
	device: 'Chrome Desktop Large',
	ignoreHTTPSErrors: false,
}

export function normalizeSettings(settings: TestSettings): TestSettings {
	// Convert user inputted seconds to milliseconds
	if (typeof settings.waitTimeout === 'number' && settings.waitTimeout > 1e3) {
		settings.waitTimeout = settings.waitTimeout / 1e3
	} else if (Number(settings.waitTimeout) === 0) {
		settings.waitTimeout = 30
	}

	// Ensure action delay is stored in seconds (assuming any value greater than 60 seconds would be ms)
	if (typeof settings.actionDelay === 'number' && settings.actionDelay > 60) {
		settings.actionDelay = settings.actionDelay / 1e3
	} else if (Number(settings.actionDelay) === 0) {
		settings.actionDelay = DEFAULT_ACTION_WAIT_SECONDS
	}

	// Ensure step delay is stored in seconds
	if (typeof settings.stepDelay === 'number' && settings.stepDelay > 60) {
		settings.stepDelay = settings.stepDelay / 1e3
	} else if (Number(settings.stepDelay) === 0) {
		settings.actionDelay = DEFAULT_STEP_WAIT_SECONDS
	}

	return settings
}
