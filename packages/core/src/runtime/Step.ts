import { Browser } from './types'

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
 * @param name Step Name
 * @param fn Actual implementation of step
 */
export declare function step(name: string, fn: StepFunction<any>): void
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
export declare function step(name: string, options: StepOptions, fn: StepFunction<any>): void

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

/**
 * StepFunction represents the function to be called as a Test step.
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
