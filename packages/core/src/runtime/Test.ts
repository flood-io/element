import Interceptor from '../network/Interceptor'
import { Browser } from './Browser'
import { EmptyReporter, IReporter, Status, StepResult } from '@flood/element-report'
import { ObjectTrace } from '../utils/ObjectTrace'
import {
	TestObserver,
	NullTestObserver,
	LifecycleObserver,
	ErrorObserver,
	InnerObserver,
	TimingObserver,
	Context,
	NetworkRecordingTestObserver,
} from './test-observers'
import { AnyErrorData, EmptyErrorData, AssertionErrorData } from './errors/Types'
import { Step, StepRecoveryObject } from './Step'
import { Looper } from '../Looper'
import { CancellationToken } from '../utils/CancellationToken'
import {
	TestSettings,
	ConcreteTestSettings,
	DEFAULT_STEP_WAIT_MILLISECONDS,
	normalizeSettings,
	DEFAULT_SETTINGS,
} from './Settings'
import { ITest } from '../interface/ITest'
import { EvaluatedScriptLike } from './EvaluatedScriptLike'
import { PlaywrightClientLike } from '../driver/Playwright'
import { ScreenshotOptions } from '../page/types'
import { Hook, HookBase, HookType } from './StepLifeCycle'
import StepIterator from './StepIterator'
import { getNumberWithOrdinal } from '../utils/numerical'
import { StructuredError } from '../utils/StructuredError'
import termImg from 'term-img'
import chalk from 'chalk'
import { basename } from 'path'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const debug = require('debug')('element:runtime:test')

export default class Test implements ITest {
	public settings: ConcreteTestSettings
	public steps: Step[]
	public hook: Hook
	public recoverySteps: StepRecoveryObject
	public runningBrowser: Browser<Step> | null
	public requestInterceptor: Interceptor
	public iteration = 0
	public failed: boolean
	public stepCount: number
	public summaryStep: StepResult[] = []
	private hookMode = false

	private testCancel: () => Promise<void> = async () => {
		return
	}

	get skipping(): boolean {
		return this.failed
	}

	constructor(
		public client: PlaywrightClientLike,
		public script: EvaluatedScriptLike,
		public reporter: IReporter = new EmptyReporter(),
		settingsFromConfig: TestSettings,
		settingsOverride: TestSettings,
		public testObserverFactory: (t: TestObserver) => TestObserver = (x) => x
	) {
		this.script = script

		try {
			const { settings, steps, recoverySteps, hook } = script

			this.settings = normalizeSettings({
				...DEFAULT_SETTINGS,
				...settingsFromConfig,
				...settings,
				...settingsOverride,
			}) as ConcreteTestSettings
			this.steps = steps
			this.recoverySteps = recoverySteps
			this.hook = hook

			// Adds output for console in script
			script.bindTest(this)
		} catch (err) {
			// XXX parsing errors. Lift to StructuredError?
			throw this.script.maybeLiftError(err)
		}

		this.requestInterceptor = new Interceptor(this.settings.blockedDomains || [])
	}

	public async cancel() {
		this.failed = true
		await this.testCancel()
	}

	public async beforeRun(): Promise<void> {
		debug('beforeRun()')
		await this.script.beforeTestRun()
	}

	public summarizeStep(): StepResult[] {
		return this.summaryStep
	}

	public resetSummarizeStep(): void {
		this.summaryStep = []
	}

	/**
	 * Runs the group of steps
	 * @return {Promise<void|Error>}
	 */
	public async run(iteration?: number): Promise<void> | never {
		await this.runWithCancellation(
			iteration || 0,
			new CancellationToken(),
			new Looper(this.settings)
		)
	}

	public async runWithCancellation(
		iteration: number,
		cancelToken: CancellationToken,
		looper: Looper
	): Promise<void> {
		console.assert(this.client, `client is not configured in Test`)
		const ctx = new Context()
		const testObserver = new ErrorObserver(
			new LifecycleObserver(
				this.testObserverFactory(
					new TimingObserver(
						ctx,
						new NetworkRecordingTestObserver(ctx, new InnerObserver(new NullTestObserver()))
					)
				)
			)
		)

		await this.requestInterceptor.attach(this.client.page)

		this.testCancel = async () => {
			await testObserver.after(this)
		}

		this.failed = false
		this.runningBrowser = null
		this.reporter.worker?.setIteration(iteration)

		debug('run() start')

		const { testData } = this.script
		const stepIterator = new StepIterator(this.steps)
		const browser = new Browser<Step>(this.script.runEnv.workRoot, this.client, this.settings)
		let testDataRecord: any
		try {
			this.runningBrowser = browser

			if (this.settings.clearCache) await browser.clearBrowserCache()
			if (this.settings.clearCookies) await browser.clearBrowserCookies()
			if (this.settings.device) await browser.emulateDevice(this.settings.device)
			if (this.settings.userAgent) {
				await browser.setUserAgent(this.settings.userAgent)
			} else {
				await this.client.reopenPage(this.settings.incognito)
			}

			if (this.settings.disableCache) await browser.setCacheDisabled(true)
			if (this.settings.extraHTTPHeaders)
				await browser.setExtraHTTPHeaders(this.settings.extraHTTPHeaders)

			browser.beforeFunc = this.willRunCommand.bind(this, testObserver)
			browser.afterFunc = this.didRunCommand.bind(this, testObserver)
			browser.setMultipleUser(!!this.reporter.worker)
			debug('running this.before(browser)')
			await testObserver.before(this)

			debug('Feeding data')
			testDataRecord = testData ? testData.feed() : {}
			const invalidName: string[] = []
			const validTestData = () => {
				if (testDataRecord === null) return false
				if (testData && testData.multiple) {
					for (const key in testDataRecord) {
						if (testDataRecord[key] === null) {
							invalidName.push(key)
						}
					}
				}
				return invalidName.length === 0
			}
			if (!validTestData()) {
				console.log(
					chalk.red(
						`${
							!invalidName.length
								? 'Test data exhausted'
								: `Test data '${invalidName.join(',')}' exhausted`
						}, consider making it circular?`
					)
				)
			} else {
				debug(JSON.stringify(testDataRecord))
			}

			debug('running hook function: beforeAll')

			let hookResult = await this.runHookFn(
				this.hook.beforeAll,
				browser,
				testDataRecord,
				testObserver
			)
			if (!hookResult) {
				stepIterator.stop()
			}

			debug('running steps')
			await stepIterator.run(async (step: Step) => {
				debug('running hook function: beforeEach')
				hookResult = await this.runHookFn(
					this.hook.beforeEach,
					browser,
					testDataRecord,
					testObserver
				)
				if (!hookResult) {
					stepIterator.stop()
					return
				}
				const condition = await stepIterator.callCondition(step, iteration, browser)
				if (!condition) {
					await this.summarizeStepBeforeRunStep(step, testObserver)
					return
				}

				browser.customContext = step

				await Promise.race([
					this.runStep(testObserver, browser, step, testDataRecord),
					cancelToken.promise,
				])

				this.summarizeStepAfterRunStep(step)

				if (cancelToken.isCancellationRequested) return

				if (this.failed) {
					const result = await stepIterator.callRecovery(
						step,
						looper,
						browser,
						this.recoverySteps,
						(this.settings.tries = 0)
					)
					if (result) {
						this.failed = false
					} else {
						await this.afterRunSteps(stepIterator)
						stepIterator.stop()
					}
				}
				debug('running hook function: afterEach')
				hookResult = await this.runHookFn(
					this.hook.afterEach,
					browser,
					testDataRecord,
					testObserver
				)
				if (!hookResult) {
					stepIterator.stop()
					return
				}
			})
			await this.afterRunSteps(stepIterator)
			if (this.settings.showScreenshot && process.env.TERM_PROGRAM === 'iTerm.app') {
				for (const path of browser.fetchScreenshots()) {
					console.log(basename(path))
					termImg(path, { width: '40%' })
				}
			}
		} catch (err) {
			this.failed = true
			console.error(chalk.red(err.message))
		} finally {
			await testObserver.after(this)
			debug('running hook function: afterAll')
			await this.runHookFn(this.hook.afterAll, browser, testDataRecord, testObserver)
		}
	}

	async afterRunSteps(stepIterator: StepIterator): Promise<void> {
		await this.requestInterceptor.detach(this.client.page)
		this.summarizeStepAfterStopRunning(stepIterator)
	}

	async summarizeStepBeforeRunStep(step: Step, testObserver: TestObserver): Promise<void> {
		if (step.prop?.unexecuted) {
			await testObserver.onStepUnexecuted(this, step)
			this.summaryStep.push({
				name: step.name,
				status: Status.UNEXECUTED,
			})
			return
		}

		if (step.prop?.skipped) {
			await testObserver.onStepSkipped(this, step)
			this.summaryStep.push({ name: step.name, status: Status.SKIPPED })
			return
		}
	}

	summarizeStepAfterRunStep(step: Step): void {
		this.summaryStep.push({
			name: step.name,
			status: step.prop?.passed ? Status.PASSED : Status.FAILED,
			subTitle: step.subTitle,
			duration: step.duration,
			error: step.prop?.error,
		})
		step.duration = 0
	}

	summarizeStepAfterStopRunning(stepIterator: StepIterator): void {
		const countRepeatStep = (step: Step): boolean => {
			const { repeat } = step.options
			if (repeat) {
				if (repeat.iteration > 0) {
					do {
						repeat.iteration += 1
						this.summaryStep.push({
							name: step.name,
							status: Status.UNEXECUTED,
							subTitle: `${getNumberWithOrdinal(repeat.iteration)} loop`,
						})
					} while (repeat.iteration < repeat.count)
				}
				repeat.iteration = 0
				return true
			}
			return false
		}

		const summarizedUnexecutedStep = (step: Step): void => {
			const countRepeatStepDone = countRepeatStep(step)
			if (countRepeatStepDone) return
			this.summaryStep.push({
				name: step.name,
				status: Status.UNEXECUTED,
			})
		}
		stepIterator.loopUnexecutedSteps(summarizedUnexecutedStep)
	}

	getStepSubtitle(step: Step): string {
		const { repeat } = step.options
		const recoveryTries = step.prop?.recoveryTries
		let subTitle = ''
		if (recoveryTries && recoveryTries > 0) {
			subTitle = `${getNumberWithOrdinal(recoveryTries)} recovery`
			this.summaryStep.pop()
		}
		if (repeat) {
			let tempTitle = ''
			const { iteration, count } = repeat
			if (iteration >= count || iteration === 0) {
				tempTitle = `${getNumberWithOrdinal(repeat.count)} loop`
			} else {
				tempTitle = `${getNumberWithOrdinal(repeat.iteration)} loop`
			}
			subTitle = subTitle ? `${tempTitle} - ${subTitle}` : tempTitle
		}
		return subTitle
	}

	get currentURL(): string {
		return (this.runningBrowser && this.runningBrowser.url) || ''
	}

	async runStep(
		testObserver: TestObserver,
		browser: Browser<Step>,
		step: Step,
		testDataRecord: any
	) {
		let error: Error | null = null
		step.subTitle = this.getStepSubtitle(step)
		await testObserver.beforeStep(this, step)

		const originalBrowserSettings = { ...browser.settings }
		try {
			debug(`Run step: ${step.name}`) // ${step.fn.toString()}`)
			browser.settings = { ...this.settings, ...step.options }
			await step.fn.call(null, browser, testDataRecord, this.reporter.worker?.name)
		} catch (err) {
			error = err
		} finally {
			browser.settings = originalBrowserSettings
		}

		if (error !== null) {
			debug('step error')
			this.failed = true
			await testObserver.onStepError(this, step, this.liftToStructuredError(error))
			step.prop = { passed: false, error: error.message }
		} else {
			await testObserver.onStepPassed(this, step)
			step.prop = { passed: true }
		}
		await testObserver.afterStep(this, step)
		if (error === null) {
			await this.doStepDelay()
		}
		debug('step done')
	}

	liftToStructuredError(error: Error): StructuredError<AnyErrorData> {
		if (error.name.startsWith('AssertionError')) {
			return new StructuredError<AssertionErrorData>(
				error.message,
				{ _kind: 'assertion' },
				error
			).copyStackFromOriginalError()
		} else if ((error as StructuredError<AnyErrorData>)._structured === 'yes') {
			return error as StructuredError<AnyErrorData>
		} else {
			// catchall - this should trigger a documentation request further up the chain
			return StructuredError.wrapBareError<EmptyErrorData>(error, { _kind: 'empty' }, 'test')
		}
	}

	public get stepNames(): string[] {
		return this.steps.map((s) => s.name)
	}

	public async doStepDelay() {
		if (this.skipping || this.settings.stepDelay <= 0) {
			return
		}

		await new Promise<void>((resolve) => {
			if (!this.settings.stepDelay) {
				resolve()
				return
			}
			setTimeout(resolve, Number(this.settings.stepDelay) || DEFAULT_STEP_WAIT_MILLISECONDS)
		})
	}

	public async willRunCommand(
		testObserver: TestObserver,
		browser: Browser<Step>,
		command: string,
		args: string
	): Promise<void> {
		if (this.hookMode) {
			await testObserver.beforeHookAction(this, command, args)
		} else {
			await testObserver.beforeStepAction(this, browser.customContext, command, args)
		}
	}

	async didRunCommand(
		testObserver: TestObserver,
		browser: Browser<Step>,
		command: string,
		args: string
	): Promise<void> {
		if (this.hookMode) {
			await testObserver.afterHookAction(this, command, args)
		} else {
			await testObserver.afterStepAction(this, browser.customContext, command, args)
		}
	}

	public async takeScreenshot(options?: ScreenshotOptions) {
		if (this.runningBrowser === null) return
		await this.runningBrowser.takeScreenshot(options)
	}

	public async fetchScreenshots(): Promise<string[]> {
		if (this.runningBrowser === null) return []
		return this.runningBrowser.fetchScreenshots()
	}

	/* @deprecated */
	newTrace(step: Step): ObjectTrace {
		return new ObjectTrace(this.script.runEnv.workRoot, step.name)
	}

	private async runHookFn(
		hooks: HookBase[],
		browser: Browser<Step>,
		testDataRecord: any,
		testObserver: TestObserver
	): Promise<boolean> {
		this.hookMode = true
		let currentHook: HookBase = hooks[0]
		try {
			for (const hook of hooks) {
				currentHook = hook
				await this.prepareHookFuncObserver(hook.type, testObserver)
				browser.settings = { ...this.settings }
				browser.settings.waitTimeout = Math.max(
					Number(browser.settings.waitTimeout),
					Number(hook.waitTimeout)
				)
				const hookFn = hook.fn.bind(null, browser, testDataRecord)
				await this.doHookFnWithTimeout(hookFn, Number(hook.waitTimeout))
				await this.finishedHookFuncObserver(hook.type, testObserver)
			}
			return true
		} catch (err) {
			console.log(err.message)
			await this.finishedHookFuncObserver(currentHook.type, testObserver)
			return false
		} finally {
			this.hookMode = false
		}
	}

	private async doHookFnWithTimeout(fn: any, timeout: number): Promise<any> {
		// Create a promise that rejects in <ms> milliseconds
		const timeoutPromise = new Promise((_, reject) => {
			setTimeout(() => {
				reject()
			}, timeout)
		})
		// Returns a race between our timeout and the passed in promise
		return Promise.race([fn(), timeoutPromise])
	}

	private async prepareHookFuncObserver(type: HookType, testObserver: TestObserver): Promise<void> {
		switch (type) {
			case HookType.beforeAll:
				await testObserver.beforeAllStep(this)
				break
			case HookType.beforeEach:
				await testObserver.beforeEachStep(this)
				break
			case HookType.afterEach:
				await testObserver.afterEachStep(this)
				break
			case HookType.afterAll:
				await testObserver.afterAllStep(this)
				break
		}
	}
	private async finishedHookFuncObserver(
		type: HookType,
		testObserver: TestObserver
	): Promise<void> {
		switch (type) {
			case HookType.beforeAll:
				await testObserver.onBeforeAllStepFinished(this)
				break
			case HookType.beforeEach:
				await testObserver.onBeforeEachStepFinished(this)
				break
			case HookType.afterEach:
				await testObserver.onAfterEachStepFinished(this)
				break
			case HookType.afterAll:
				await testObserver.onAfterAllStepFinished(this)
				break
		}
	}
}
