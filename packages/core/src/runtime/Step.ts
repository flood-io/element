import { Browser } from './types'
import { ElementPresence } from './Settings'

/**
 * Declares each step in your test. This must go within your main test expression.
 *
 * **Example:**
 *
 * ```typescript
 * export default () => {
 *   step("Step 1", async (browser: Browser) => {
 *     await browser.visit("https://example.com")
 *   })
 *
 *   step("Step 2", async (browser: Browser) => {})
 *
 *   step("Step 3", async (browser: Browser) => {})
 * }
 * ```
 *
 * @param name Step Name
 * @param fn Actual implementation of step
 */
export declare function step<T>(name: string, fn: StepFunction<T>): void
/**
 * `step` can also be called with an overridden subset of Test settings (`options`) valid for just this step.
 *
 * ```typescript
 *   // Step 1 takes longer than the default `waitTimeout` of 30s.
 *   step("Step 1", { waitTimeout: 90 }, async browser => {
 *     ...
 *   }
 * ```
 */
export declare function step<T>(name: string, options: StepOptions, fn: StepFunction<T>): void

export type StepDefinition<T> = (name: string, fn: StepFunction<T>) => Promise<any>

/**
 * Specifies the available options which can be supplied to a step to override global settings.
 *
 * **Example:**
 *
 * ```typescript
 * step("Step 1", { waitTimeout: 300 }, async (browser: Browser) => {
 * 	await browser.click(...)
 * })
 * ```
 */
export interface StepOptions {
	/**
	 * Timeout in seconds for all wait and navigation operations within this <[step]>.
	 * @default `30` seconds
	 */
	waitTimeout?: number

	/**
	 * Override global auto wait setting. Uses `waitTimeout` from step if defined.
	 *
	 * @default `inherit`
	 */
	waitUntil?: ElementPresence

	/**
	 * step will run one time
	 */
	onceOff?: boolean
}

/**
 * The `StepFunction` type represents a function to be called as a Test step.
 *
 * - `browser` <[Browser]> the browser
 * - `data` <`T`> (Optional) a row of test data of type <`T`>. Only available when the test is set up using <[suite]>.
 *
 * **Example:**
 *
 * ```typescript
 * const step1: StepFunction = async (browser: Browser) => {
 * 	await browser.click(...)
 * }
 * ```
 */
export type StepFunction<T> = (driver: Browser, data?: T) => Promise<void>

/**
 * @internal
 */
export interface Step {
	fn: StepFunction<any>
	name: string
	stepOptions: StepOptions
}

/**
 * @internal
 */
export function normalizeStepOptions(stepOpts: StepOptions): StepOptions {
	// Convert user inputted seconds to milliseconds
	if (typeof stepOpts.waitTimeout === 'number' && stepOpts.waitTimeout > 1e3) {
		stepOpts.waitTimeout = stepOpts.waitTimeout / 1e3
	} else if (Number(stepOpts.waitTimeout) === 0) {
		stepOpts.waitTimeout = 30
	}

	return stepOpts
}
