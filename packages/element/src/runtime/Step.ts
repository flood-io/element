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
 * @param {string} name Step Name
 * @param {(driver: Driver) => Promise<void>} fn Actual implementation of step
 */
export declare function step(name: string, fn: StepFunction<any>): void
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

export interface Step {
	fn: StepFunction<any>
	name: string
	stepOptions: StepOptions
}

export type StepFunction<T> = (driver: Browser, data?: T) => Promise<void>

export function normalizeStepOptions(stepOpts: StepOptions): StepOptions {
	// Convert user inputted seconds to milliseconds
	if (typeof stepOpts.waitTimeout === 'number' && stepOpts.waitTimeout > 1e3) {
		stepOpts.waitTimeout = stepOpts.waitTimeout / 1e3
	} else if (Number(stepOpts.waitTimeout) === 0) {
		stepOpts.waitTimeout = 30
	}

	return stepOpts
}
