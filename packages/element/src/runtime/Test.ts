import { EvaluatedScript } from './EvaluatedScript'
// import NetworkRecorder from '../network/Recorder'
// import Observer from './Observer'
import { Browser } from './Browser'

import { IReporter } from './../Reporter'
import { NullReporter } from './../reporter/Null'
import { ObjectTrace } from '../utils/ObjectTrace'

import { TestObserver, NullTestObserver } from './test-observers/Observer'
import LifecycleObserver from './test-observers/Lifecycle'
import ErrorObserver from './test-observers/Errors'
import InnerObserver from './test-observers/Inner'

import { AnyErrorData, EmptyErrorData, AssertionErrorData } from './errors/Types'
import { StructuredError } from '../utils/StructuredError'

import { Step } from './Step'

import { CancellationToken } from '../utils/CancellationToken'

import { IPuppeteerClient } from '../driver/Puppeteer'
import { ScreenshotOptions } from 'puppeteer'
import { TestSettings, ConcreteTestSettings, DEFAULT_STEP_WAIT_SECONDS } from './Settings'
// import { ScreenshotOptions } from 'puppeteer'

// import { readdirSync } from 'fs'

import * as debugFactory from 'debug'
const debug = debugFactory('element:runtime:test')

export default class Test {
	public settings: ConcreteTestSettings
	public steps: Step[]

	public runningBrowser: Browser<Step> | null

	// public networkRecorder: NetworkRecorder
	// public observer: Observer

	public testObserver: TestObserver

	public iteration: number = 0

	public failed: boolean

	get skipping(): boolean {
		return this.failed
	}

	constructor(
		public client: IPuppeteerClient,
		public script: EvaluatedScript,
		public reporter: IReporter = new NullReporter(),
		settingsOverride: TestSettings,
		public testObserverFactory: (t: TestObserver) => TestObserver = x => x,
	) {
		// this.testObserver = new NullTestObserver()
		this.testObserver = new ErrorObserver(
			new LifecycleObserver(this.testObserverFactory(new InnerObserver(new NullTestObserver()))),
		)
		this.script = script

		try {
			let { settings, steps } = script
			this.settings = settings
			this.steps = steps

			// Adds output for console in script
			script.bindTest(this)
		} catch (err) {
			// XXX parsing errors. Lift to StructuredError?
			throw this.script.maybeLiftError(err)
		}

		Object.assign(this.settings, settingsOverride)
	}

	public async cancel() {
		this.failed = true
		await this.testObserver.after(this)
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
		await this.runWithCancellation(iteration || 0, new CancellationToken())
	}

	public async runWithCancellation(
		iteration: number,
		cancelToken: CancellationToken,
	): Promise<void> | never {
		console.assert(this.client, `client is not configured in Test`)

		// await (await this.client).reopenPage()

		this.failed = false
		this.runningBrowser = null
		// await this.observer.attachToNetworkRecorder()

		debug('run() start')

		const { testData } = this.script

		try {
			const browser = new Browser<Step>(
				this.script.runEnv.workRoot,
				this.client,
				this.settings,
				this.willRunCommand.bind(this),
				this.didRunCommand.bind(this),
			)

			this.runningBrowser = browser

			if (this.settings.clearCache) await browser.clearBrowserCache()
			if (this.settings.clearCookies) await browser.clearBrowserCookies()
			if (this.settings.device) await browser.emulateDevice(this.settings.device)
			if (this.settings.userAgent) await browser.setUserAgent(this.settings.userAgent)
			if (this.settings.disableCache) await browser.setCacheDisabled(true)

			debug('running this.before(browser)')
			await this.testObserver.before(this)

			debug('Feeding data')
			let testDataRecord = testData.feed()
			if (testDataRecord === null) {
				throw new Error('Test data exhausted, consider making it circular?')
			} else {
				debug(JSON.stringify(testDataRecord))
			}

			debug('running steps')
			for (let step of this.steps) {
				browser.customContext = step

				await Promise.race([this.runStep(browser, step, testDataRecord), cancelToken.promise])

				if (cancelToken.isCancellationRequested) return

				if (this.failed) {
					console.log('failed, bailing out of steps')
					break
				}
			}
		} catch (err) {
			console.log('error -> failed')
			this.failed = true
			throw err
		}

		// TODO report skipped steps

		await this.testObserver.after(this)
	}

	get currentURL(): string {
		if (this.runningBrowser == null) {
			return ''
		} else {
			return this.runningBrowser.url
		}
	}

	async runStep(browser: Browser<Step>, step: Step, testDataRecord: any) {
		let error: Error | null = null
		await this.testObserver.beforeStep(this, step)
		try {
			debug(`Run step: ${step.name}`) // ${step.fn.toString()}`)

			browser.settings = { ...this.settings, ...step.stepOptions }
			await step.fn.call(null, browser, testDataRecord)
		} catch (err) {
			error = err
		}

		if (error !== null) {
			debug('step error')
			console.log('step error -> failed')
			this.failed = true

			await this.testObserver.onStepError(this, step, this.liftToStructuredError(error))
		} else {
			await this.testObserver.onStepPassed(this, step)
		}

		await this.testObserver.afterStep(this, step)

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
		} else if ((<StructuredError<AnyErrorData>>error)._structured === 'yes') {
			return <StructuredError<AnyErrorData>>error
		} else {
			// catchall - this should trigger a documentation request further up the chain
			return StructuredError.wrapBareError<EmptyErrorData>(error, { _kind: 'empty' }, 'test')
		}
	}

	/* 
	private async didRunStep(name: string, screenshots: string[]): Promise<void> {
		if (this.skipped.length > 0) {
			debug('didRunStep - skipped', name)
			try {
				// Process skip callbacks
				for (const name of this.skipped) {
					await this.didSkip(name)
				}
				this.skipped = []
			} catch (err) {
				console.error(`Error in skip callbacks`, err)
			}
		} else if (this.hasErrors) {
			debug('didRunStep - errors', name)
			this.skipAll = true
			try {
				// Process error callbacks
				for (const err of this.errors) {
					await this.didError(err, name)
				}

				this.errors = []
			} catch (err) {
				console.error(`Error in error callbacks`, err)
			}
		} else {
			debug('didRunStep - succeeded', name)
			try {
				await this.didSucceed(name)
			} catch (err) {
				console.error(`Error in stepDidSucceed:`, err)
			}
		}
		return runCallback.apply(this, [CallbackQueue.AfterStep, name, screenshots])
	}
 */

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

	public async willRunCommand(browser: Browser<Step>, command: string) {
		const step: Step = browser.customContext
		await this.testObserver.beforeStepAction(this, step, command)

		debug(`Before action: '${command}()' waiting on actionDelay: ${this.settings.actionDelay}`)
	}

	async didRunCommand(browser: Browser<Step>, command: string) {
		await this.testObserver.afterStepAction(this, browser.customContext, command)
	}

	public async takeScreenshot(options?: ScreenshotOptions) {
		if (this.runningBrowser === null) {
			return []
		}

		await this.runningBrowser.takeScreenshot(options)
	}

	public async fetchScreenshots(): Promise<string[]> {
		if (this.runningBrowser === null) {
			return []
		}

		return this.runningBrowser.fetchScreenshots()
	}

	// private get numberOfBrowsers() {
	// try {
	// let lockFiles = readdirSync('/test/lock')
	// return lockFiles.length
	// } catch (err) {
	// return 1
	// }
	// }

	newTrace(step: Step): ObjectTrace {
		return new ObjectTrace(this.script.runEnv.workRoot, step.name)
	}

	// public async syncNetworkRecorder() {
	// await this.networkRecorder.sync()
	// }
}
