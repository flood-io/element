// Stub out browser interface
interface Browser {
	wait(_: any): Promise<void>
	fill(selector: string, text: string): Promise<void>
}

export interface StepBase {
	(stepName: string, options: StepOptions, testFn: TestFn): void
	(stepName: string, testFn: TestFn): void
	(stepName: string, ...optionsOrFn: any[]): void
}

export interface StepConditionalBase {
	(condition: ConditionFn, stepName: string, options: StepOptions, testFn: TestFn): void
	(condition: ConditionFn, stepName: string, testFn: TestFn): void
	(condition: ConditionFn, stepName: string, ...optionsOrFn: any[]): void
}

export interface StepExtended extends StepBase {
	/**
	 * Defines a test step which will run in all iterations assuming the previous step succeeded
	 */
	once: StepBase

	/**
	 * Creates a conditional step, which will only run if the preceeding predicate returns true
	 */
	if: StepConditionalBase

	/**
	 * Creates a conditional step, which will only run if the preceeding predicate returns false
	 */
	unless: StepConditionalBase
}

type StepOptions = {
	pending?: boolean
	once?: boolean
	condition?: ConditionFn
}

type TestFn = (this: void, browser: Browser) => Promise<any>
type ConditionFn = (this: void, browser: Browser) => boolean | Promise<boolean>

const elementIsVisible = (selector: string) => async (browser: Browser): Promise<boolean> => {
	return browser.wait(selector).then(() => true)
}

function extractOptionsAndCallback(args: any[]): [Partial<StepOptions>, TestFn] {
	if (args.length === 0) return [{ pending: true }, () => Promise.resolve()]
	if (args.length === 1) return [{}, args[0]]
	if (args.length === 2) return args as [Partial<StepOptions>, TestFn]
	throw new Error(`Step called with too many arguments`)
}

type Step = {
	name: string
	options: Partial<StepOptions>
	fn: TestFn
}

const steps: Step[] = []

const step: StepExtended = (name: string, ...optionsOrFn: any[]) => {
	const [options, fn] = extractOptionsAndCallback(optionsOrFn)
	steps.push({ options, name, fn })
}

step.once = (name: string, ...optionsOrFn: any[]) => {
	const [options, fn] = extractOptionsAndCallback(optionsOrFn)
	step(name, { ...options, once: true }, fn)
}
step.if = (condition: ConditionFn, name: string, ...optionsOrFn: any[]) => {
	const [options, fn] = extractOptionsAndCallback(optionsOrFn)
	step(name, { ...options, condition }, fn)
}
step.unless = (condition: ConditionFn, name: string, ...optionsOrFn: any[]) => {
	const [options, fn] = extractOptionsAndCallback(optionsOrFn)
	step(
		name,
		{ ...options, condition: (b) => Promise.resolve(condition(b)).then((result) => !result) },
		fn
	)
}

const testScriptExport = () => {
	step.once('Load app', async () => {
		// Browser.visit(...)
	})

	step.if(elementIsVisible('button.login'), 'Handle conditional login', async (browser) => {
		await browser.fill('username', 'test@user')
		// More login steps here
	})

	step.unless(
		async () => {
			return false
		},
		'Unless thing is here',
		async () => {
			// Do conditional work here
		}
	)
	step('Do something')
}

testScriptExport()

console.log(steps)
