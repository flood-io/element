import Interceptor from '../network/Interceptor'
import { Browser } from './Browser'

import { IReporter } from '../Reporter'
import { NullReporter } from '../reporter/Null'
import { ObjectTrace } from '../utils/ObjectTrace'

import { TestObserver, NullTestObserver } from './test-observers/Observer'
import LifecycleObserver from './test-observers/Lifecycle'
import ErrorObserver from './test-observers/Errors'
import InnerObserver from './test-observers/Inner'

import { AnyErrorData, EmptyErrorData, AssertionErrorData } from './errors/Types'
import { StructuredError } from '../utils/StructuredError'

import { Step, ConditionFn, StepRecoveryObject, RecoverWith } from './Step'
import { Looper } from '../Looper'

import { CancellationToken } from '../utils/CancellationToken'

import { PuppeteerClientLike } from '../driver/Puppeteer'
import { ScreenshotOptions } from 'puppeteer'
import { TestSettings, ConcreteTestSettings, DEFAULT_STEP_WAIT_SECONDS } from './Settings'
import { ITest } from './ITest'
import { EvaluatedScriptLike } from './EvaluatedScriptLike'
import { TimingObserver } from './test-observers/TimingObserver'
import { Context } from './test-observers/Context'
import { NetworkRecordingTestObserver } from './test-observers/NetworkRecordingTestObserver'
import { Hook, HookBase } from './Hook'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const debug = require('debug')('element:runtime:test')

export default class Test implements ITest {
	public settings: ConcreteTestSettings
	public steps: Step[]
	public hook: Hook
	public recoverySteps: StepRecoveryObject

	public runningBrowser: Browser<Step> | null

	public requestInterceptor: Interceptor

	private testCancel: () => Promise<void> = async () => {
		return
	}

	public iteration = 0

	public failed: boolean

	public stepCount: number

	get skipping(): boolean {
		return this.failed
	}

	constructor(
		public client: PuppeteerClientLike,
		public script: EvaluatedScriptLike,
		public reporter: IReporter = new NullReporter(),
		settingsOverride: TestSettings,
		public testObserverFactory: (t: TestObserver) => TestObserver = x => x,
	) {
		this.script = script

		try {
			const { settings, steps, recoverySteps, hook } = script
			this.settings = settings as ConcreteTestSettings
			this.steps = steps
			this.recoverySteps = recoverySteps
			this.hook = hook

			// Adds output for console in script
			script.bindTest(this)
		} catch (err) {
			// XXX parsing errors. Lift to StructuredError?
			throw this.script.maybeLiftError(err)
		}

		Object.assign(this.settings, settingsOverride)
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

	/**
	 * Runs the group of steps
	 * @return {Promise<void|Error>}
	 */
	public async run(iteration?: number): Promise<void> | never {
		await this.runWithCancellation(
			iteration || 0,
			new CancellationToken(),
			new Looper(this.settings),
		)
	}

	public async runWithCancellation(
		iteration: number,
		cancelToken: CancellationToken,
		looper: Looper,
	): Promise<void> {
		console.assert(this.client, `client is not configured in Test`)

		const ctx = new Context()

		const testObserver = new ErrorObserver(
			new LifecycleObserver(
				this.testObserverFactory(
					new TimingObserver(
						ctx,
						new NetworkRecordingTestObserver(ctx, new InnerObserver(new NullTestObserver())),
					),
				),
			),
		)

		await (await this.client).reopenPage(this.settings.incognito)
		await this.requestInterceptor.attach(this.client.page)

		this.testCancel = async () => {
			await testObserver.after(this)
		}

		this.failed = false
		this.runningBrowser = null
		this.stepCount = 0

		// await this.observer.attachToNetworkRecorder()

		debug('run() start')

		const { testData } = this.script
		let browser: Browser<Step>
		let testDataRecord: any
		try {
			browser = new Browser<Step>(
				this.script.runEnv.workRoot,
				this.client,
				this.settings,
				this.willRunCommand.bind(this, testObserver),
				this.didRunCommand.bind(this, testObserver),
			)
			this.runningBrowser = browser

			if (this.settings.clearCache) await browser.clearBrowserCache()
			if (this.settings.clearCookies) await browser.clearBrowserCookies()
			if (this.settings.device) await browser.emulateDevice(this.settings.device)
			if (this.settings.userAgent) await browser.setUserAgent(this.settings.userAgent)
			if (this.settings.disableCache) await browser.setCacheDisabled(true)
			if (this.settings.extraHTTPHeaders)
				await browser.setExtraHTTPHeaders(this.settings.extraHTTPHeaders)

			debug('running this.before(browser)')
			await testObserver.before(this)

			debug('Feeding data')
			testDataRecord = testData.feed()
			if (testDataRecord === null) {
				throw new Error('Test data exhausted, consider making it circular?')
			} else {
				debug(JSON.stringify(testDataRecord))
			}

			const callPredicate = async (predicate: ConditionFn): Promise<boolean> => {
				let condition = false
				try {
					condition = await predicate.call(null, browser)
				} catch (err) {
					console.log(err.message)
				}
				if (!condition) this.stepCount += 1
				return condition
			}

			const callCondition = async (step: Step): Promise<boolean> => {
				const { once, skip, pending, repeat, stepWhile } = step.options

				if (pending) {
					console.log(`(Pending) ${step.name}`)
					this.stepCount += 1
					return false
				}

				if (once && iteration > 1) {
					this.stepCount += 1
					return false
				}

				if (skip) {
					console.log(`Skip test ${step.name}`)
					this.stepCount += 1
					return false
				}

				if (repeat) {
					if (repeat.iteration < repeat.count - 1) {
						this.stepCount -= 1
						repeat.iteration += 1
					} else {
						repeat.iteration = 0
					}
				}

				if (stepWhile) {
					const { predicate } = stepWhile
					const result = await callPredicate(predicate)
					if (result) this.stepCount -= 1
					return result
				}

				return true
			}

			const callRecovery = async (step: Step): Promise<boolean> => {
				let { iteration } = this.recoverySteps[step.name]
				const { recoveryStep, loopCount } = this.recoverySteps[step.name]
				const { recoveryTries } = this.settings
				const settingRecoveryCount = loopCount || recoveryTries || 1
				if (!recoveryStep || iteration >= settingRecoveryCount) {
					iteration = 0
					return false
				}
				iteration += 1
				try {
					const result = await recoveryStep.fn.call(null, browser)
					if (result === RecoverWith.CONTINUE) {
						this.stepCount += 1
					} else if (result === RecoverWith.RESTART) {
						looper.restartLoop()
						this.stepCount = this.steps.length
					}
				} catch (err) {
					return false
				}
				this.failed = false
				return true
			}

			debug('running hook function: beforeAll')
			await this.runHookFnc(this.hook.beforeAll, browser, testDataRecord)

			debug('running steps')
			while (this.stepCount < this.steps.length) {
				debug('running hook function: beforeEach')
				await this.runHookFnc(this.hook.beforeEach, browser, testDataRecord)
				const step = this.steps[this.stepCount]
				const condition = await callCondition(step)
				if (!condition) continue

				const { predicate } = step.options
				if (predicate) {
					const condition = await callPredicate(predicate)
					if (!condition) {
						debug('condition failling')
						continue
					}
				}

				browser.customContext = step

				await Promise.race([
					this.runStep(testObserver, browser, step, testDataRecord),
					cancelToken.promise,
				])

				if (cancelToken.isCancellationRequested) return

				if (this.failed) {
					const result = await callRecovery(step)
					if (result) continue
					console.log('failed, bailing out of steps')
					throw Error('test failed')
				}
				this.stepCount += 1

				debug('running hook function: afterEach')
				await this.runHookFnc(this.hook.afterEach, browser, testDataRecord)
			}
		} catch (err) {
			console.log('error -> failed', err)
			this.failed = true
			throw err
		} finally {
			await this.requestInterceptor.detach(this.client.page)
		}
		// TODO report skipped steps
		await testObserver.after(this)

		debug('running hook function: afterAll')
		await this.runHookFnc(this.hook.afterAll, browser, testDataRecord)
	}

	get currentURL(): string {
		if (this.runningBrowser == null) {
			return ''
		} else {
			return this.runningBrowser.url
		}
	}

	async runStep(
		testObserver: TestObserver,
		browser: Browser<Step>,
		step: Step,
		testDataRecord: any,
	) {
		let error: Error | null = null
		await testObserver.beforeStep(this, step)

		const originalBrowserSettings = { ...browser.settings }

		try {
			debug(`Run step: ${step.name}`) // ${step.fn.toString()}`)
			browser.settings = { ...this.settings, ...step.options }
			await step.fn.call(null, browser, testDataRecord)
		} catch (err) {
			error = err
		} finally {
			browser.settings = originalBrowserSettings
		}

		if (error !== null) {
			debug('step error')
			console.log('step error -> failed')
			this.failed = true

			await testObserver.onStepError(this, step, this.liftToStructuredError(error))
		} else {
			await testObserver.onStepPassed(this, step)
		}

		await testObserver.afterStep(this, step)

		if (error === null) {
			await this.doStepDelay()
		}

		// await this.syncNetworkRecorder()
		// this.networkRecorder.reset()
		debug('step done')
	}

	liftToStructuredError(error: Error): StructuredError<AnyErrorData> {
		if (error.name.startsWith('AssertionError')) {
			return new StructuredError<AssertionErrorData>(
				error.message,
				{ _kind: 'assertion' },
				error,
			).copyStackFromOriginalError()
		} else if ((error as StructuredError<AnyErrorData>)._structured === 'yes') {
			return error as StructuredError<AnyErrorData>
		} else {
			// catchall - this should trigger a documentation request further up the chain
			return StructuredError.wrapBareError<EmptyErrorData>(error, { _kind: 'empty' }, 'test')
		}
	}

	public get stepNames(): string[] {
		return this.steps.map(s => s.name)
	}

	public async doStepDelay() {
		if (this.skipping || this.settings.stepDelay <= 0) {
			return
		}

		await new Promise(resolve => {
			if (!this.settings.stepDelay) {
				resolve()
				return
			}
			setTimeout(resolve, this.settings.stepDelay * 1e3 || DEFAULT_STEP_WAIT_SECONDS * 1e3)
		})
	}

	public async willRunCommand(testObserver: TestObserver, browser: Browser<Step>, command: string) {
		if (browser.customContext) {
			await testObserver.beforeStepAction(this, browser.customContext, command)
			debug(`Before action: '${command}()' waiting on actionDelay: ${this.settings.actionDelay}`)
		}
	}

	async didRunCommand(testObserver: TestObserver, browser: Browser<Step>, command: string) {
		if (browser.customContext) {
			await testObserver.afterStepAction(this, browser.customContext, command)
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

	private async runHookFnc(
		hooks: HookBase[],
		browser: Browser<Step>,
		testDataRecord: any,
	): Promise<void> {
		try {
			for (const hook of hooks) {
				browser.settings = { ...this.settings }
				browser.settings.waitTimeout = hook.waitTimeout
				const hookFunc = hook.fn.bind(null, browser, testDataRecord)
				await this.doHookFncWithTimeout(hookFunc, hook.waitTimeout)
			}
		} catch (error) {
			throw new Error(error)
		}
	}

	private async doHookFncWithTimeout(func: any, timeout: number): Promise<any> {
		// Create a promise that rejects in <ms> milliseconds
		const promiseTimeout = new Promise((_, reject) => {
			const id = setTimeout(() => {
				clearTimeout(id)
				reject()
			}, timeout * 1e3)
		})
		// Returns a race between our timeout and the passed in promise
		return Promise.race([func(), promiseTimeout])
	}
}
