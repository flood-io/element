import { ElementPresence, DEFAULT_WAIT_TIMEOUT_SECONDS } from './Settings'
import ms from 'ms'
import { Browser } from './IBrowser'

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
 *   step.recovery("Step 2", async (browser: Browser) => {
 *     // do stuff
 *     return RecoverWith.RETRY //retry step 2 (default)
 *     return RecoverWith.RESTART //restart step 1
 *     return RecoverWith.CONTINUE //continue next step
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
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
export const step: StepExtended = (...nameOrOptionsOrFn: any[]) => {}
step.once = (...nameOrOptionsOrFn: any[]) => {}
step.if = (condition: ConditionFn, ...nameOrOptionsOrFn: any[]) => {}
step.unless = (condition: ConditionFn, ...nameOrOptionsOrFn: any[]) => {}
step.skip = (...nameOrOptionsOrFn: any[]) => {}
step.recovery = (...nameOrOptionsOrFn: any[]) => {}
step.repeat = (count: number, ...nameOrOptionsOrFn: any[]) => {}
step.while = (condition: ConditionFn, ...nameOrOptionsOrFn: any[]) => {}

export interface StepBase {
	(stepName: string, options: StepOptions, testFn: TestFn): void
	(stepName: string, testFn: TestFn): void
	(options: StepOptions, testFn: TestFn): void
	(testFn: TestFn): void
}

export interface StepConditionBase {
	(condition: ConditionFn, name: string, options: StepOptions, testFn: TestFn)
	(condition: ConditionFn, name: string, testFn: TestFn)
	(condition: ConditionFn, ...optionsOrFn: any[])
}

export interface StepRepeatablebase {
	(count: number, name: string, options: StepOptions, testFn: TestFn)
	(count: number, name: string, testFn: TestFn)
	(count: number, ...optionsOrFn: any[])
}

export interface StepExtended extends StepBase {
	/**
	 * Defines a test step which will run in all iterations assuming the previous step succeeded
	 */
	once: StepBase

	/**
	 * Creates a conditional step, which will only run if the preceeding predicate returns true
	 */
	if: StepConditionBase

	/**
	 * Creates a conditional step, which will only run if the preceeding predicate returns false
	 */
	unless: StepConditionBase

	/**
	 * Creates a conditional step, which will skip this test
	 */
	skip: StepBase

	/**
	 * Creates a recovery step
	 */
	recovery: StepBase

	/**
	 * Creates a repeatable step
	 */
	repeat: StepRepeatablebase

	/**
	 * Creates a while step
	 */
	while: StepConditionBase
}

export type StepDefinition = (name: string, fn: TestFn) => Promise<any>
export type TestFn = (this: void, browser: Browser) => Promise<any>
export type ConditionFn = (this: void, browser: Browser) => boolean | Promise<boolean>
export type StepOptions = {
	pending?: boolean
	once?: boolean
	predicate?: ConditionFn
	skip?: boolean
	waitTimeout?: any
	waitUntil?: ElementPresence
	tries?: number
	repeat?: {
		count: number
		iteration: number
	}
	stepWhile?: {
		predicate: ConditionFn
	}
}

export function extractStep(args: any[]): [string, Partial<StepOptions>, TestFn] {
	if (args.length === 0) throw new Error('Step called with at least one argument') // [{ pending: true }, () => Promise.resolve()]
	if (args.length === 1) {
		return ['global', {}, args[0] as TestFn]
	} else if (args.length === 2) {
		const [name, fnc] = args as [string, TestFn]
		if (typeof name === 'string') {
			return [name, {}, fnc]
		}
		const [options, fn] = args as [StepOptions, TestFn]
		const { waitTimeout, waitUntil, tries } = options
		return ['global', { waitTimeout, waitUntil, tries }, fn]
	} else if (args.length === 3) {
		const [name, options, fn] = args as [string, StepOptions, TestFn]
		const { waitTimeout, waitUntil, tries } = options
		return [name, { waitTimeout, waitUntil, tries }, fn]
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
export type StepRecoveryObject = {
	[name: string]: {
		recoveryStep: Step
		loopCount: number
		iteration: number
	}
}

/**
 * The `RecoverWith` represents an action which we will do after the recovery step has finished
 * ```
 * RETRY: retry the failed step
 * RESTART: re-run the first step
 * CONTINUE: continue next step
 * ```
 */
export enum RecoverWith {
	RETRY = 'retry',
	RESTART = 'restart',
	CONTINUE = 'continue',
}

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
	if (typeof stepOpts.waitTimeout === 'string' && stepOpts.waitTimeout) {
		stepOpts.waitTimeout = ms(stepOpts.waitTimeout)
	}
	if (stepOpts.waitTimeout <= 0) {
		stepOpts.waitTimeout = ms(DEFAULT_WAIT_TIMEOUT_SECONDS)
	}

	return stepOpts
}
