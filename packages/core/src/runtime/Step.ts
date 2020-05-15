import { Browser } from './types'
import { ElementPresence } from './Settings'

/**
 * Declares each step in your test. This must go within your main test expression.
 *
 * **Example:**
 *
 * ```typescript
 * export default () => {
 *   step.once("Step 1", async (browser: Browser) => {
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
 * @param options step options
 */
export const step: StepExtended = (name: string, ...optionsOrFn: any[]) => {}
step.once = (name: string, ...optionsOrFn: any[]) => {}

export interface StepBase {
	(stepName: string, options: StepOptions, testFn: TestFn): void
	(stepName: string, testFn: TestFn): void
	(stepName: string, ...optionsOrFn: any[]): void
}

export interface StepExtended extends StepBase {
	/**
	 * Defines a test step which will run in all iterations assuming the previous step succeeded
	 */
	once: StepBase
}

export type StepDefinition = (name: string, fn: TestFn) => Promise<any>
export type TestFn = (this: void, browser: Browser) => Promise<any>
export type StepOptions = {
	pending?: boolean
	once?: boolean
	waitTimeout?: number
	waitUntil?: ElementPresence
}

export function extractOptionsAndCallback(args: any[]): [Partial<StepOptions>, TestFn] {
	if (args.length === 0) return [{ pending: true }, () => Promise.resolve()]
	if (args.length === 1) {
		return [{}, args[0]]
	} else if (args.length === 2) {
		const [options, fn] = args as [StepOptions, TestFn]
		return [options, fn]
	}
	throw new Error(`Step called with too many arguments`)
}

/**
 * The `StepFunction` type represents a function to be called as a Test step.
 *
 * - `browser` <[Browser]> the browser
 * - `data` <`T`> (Optional) a row of test data of type <`T`>. Only available when the test is set up using <[suite]>.
 *
 * **Example:**
 *
 * ```
 * const step1: StepFunction = async (browser: Browser) => {
 * 	await browser.click(...)
 * }
 * ```
 */
export type StepFunction<T> = (driver: Browser, data?: T) => Promise<void>

/**
 * @internal
 */
export type Step = {
	name: string
	options: Partial<StepOptions>
	fn: TestFn
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
