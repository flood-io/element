import { VM } from './VM'
import NetworkRecorder from '../network/Recorder'
import Observer from './Observer'
import { Browser } from './Browser'

import { IReporter } from './../Reporter'
import { NullReporter } from './../reporter/Null'
import { ObjectTrace } from '../utils/ObjectTrace'

import { TestObserver, NullTestObserver } from './test-observers/Observer'
import TimingObserver from './test-observers/Timing'
import TracingObserver from './test-observers/Tracing'
import LifecycleObserver from './test-observers/Lifecycle'
import ErrorObserver from './test-observers/Errors'

import { AnyErrorData, EmptyErrorData, AssertionErrorData } from './errors/Types'
import { StructuredError } from '../utils/StructuredError'

import { Step } from './Step'

import { PuppeteerClient } from '../types'
import { RuntimeEnvironment } from '../runtime-environment/types'
import { ITestScript } from '../TestScript'
import { ScreenshotOptions } from 'puppeteer'
import {
	ConcreteTestSettings,
	DEFAULT_ACTION_WAIT_SECONDS,
	DEFAULT_STEP_WAIT_SECONDS,
} from './Settings'
// import { ScreenshotOptions } from 'puppeteer'

import { TestData } from '../test-data/TestData'
import { TestDataLoaders } from '../test-data/TestDataLoaders'

// import { readdirSync } from 'fs'

import * as debugFactory from 'debug'
const debug = debugFactory('element:test')

export default class Test {
	public vm: VM
	public settings: ConcreteTestSettings
	public steps: Step[]

	public runningBrowser: Browser<Step> | null

	public networkRecorder: NetworkRecorder
	public observer: Observer

	public testObserver: TestObserver

	public iteration: number = 0

	public script: ITestScript
	public failed: boolean

	private driver: PuppeteerClient

	public testData: TestData<any>
	public testDataLoaders: TestDataLoaders<any>

	get skipping(): boolean {
		return this.failed
	}

	constructor(private runEnv: RuntimeEnvironment, public reporter: IReporter = new NullReporter()) {
		this.testObserver = new ErrorObserver(
			new TimingObserver(new LifecycleObserver(new TracingObserver(new NullTestObserver()))),
		)

		this.testDataLoaders = new TestDataLoaders(runEnv.workRoot)
		this.testData = this.testDataLoaders.fromData([{}]).circular()
	}

	public async shutdown() {
		await this.testObserver.after(this)
	}

	public enqueueScript(script: ITestScript): ConcreteTestSettings {
		this.script = script

		this.vm = new VM(this.runEnv, script)

		try {
			let { settings, steps } = this.vm.evaluate(this)
			this.settings = settings
			this.steps = steps

			// Adds output for console in script
			this.vm.bindReporter(this.reporter)
		} catch (err) {
			// XXX parsing errors. Lift to StructuredError?
			throw this.script.maybeLiftError(err)
		}

		return this.settings
	}

	public attachDriver(driver: PuppeteerClient) {
		console.assert(driver, `Driver is not defined`)
		console.assert(!this.driver, `Driver already attached`)

		this.driver = driver

		// TODO could this be pushed down into Browser?
		this.networkRecorder = new NetworkRecorder(this.driver.page)
		this.observer = new Observer(this.reporter, this.networkRecorder)

		// TODO refactor
		// Adds filter for console messages emitted by the browser
		this.observer.consoleFilters = this.settings.consoleFilter || []
	}

	/**
	 * Runs the group of steps
	 * @return {Promise<void|Error>}
	 */
	public async run(iteration?: number): Promise<void | Error> {
		console.assert(this.driver, `Driver is not configured in Test`)
		// let skipped: Step[] = []
		// let errors: Error[] = []

		debug('run() start')
		await this.testData.load()

		try {
			const browser = new Browser<Step>(
				this.runEnv.workRoot,
				this.driver,
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

			await this.observer.attach()

			debug('running this.before(browser)')
			await this.testObserver.before(this)

			debug('Feeding data')
			let testDataRecord = this.testData.feed()
			if (testDataRecord === null) {
				throw new Error('Test data exhausted, consider making it circular?')
			} else {
				debug(JSON.stringify(testDataRecord))
			}

			debug('running steps')
			for (let step of this.steps) {
				browser.customContext = step

				await this.runStep(browser, step, testDataRecord)

				if (this.failed) {
					break
				}
			}
		} catch (err) {
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
		this.networkRecorder.reset()

		let error: Error | null = null
		await this.testObserver.beforeStep(this, step)
		try {
			debug(`Run step: ${step.name} ${step.fn.toString()}`)

			browser.settings = { ...this.settings, ...step.stepOptions }
			await step.fn.call(null, browser, testDataRecord)
		} catch (err) {
			error = err
		}

		if (error !== null) {
			debug('step error')
			this.failed = true

			await this.testObserver.onStepError(this, step, this.liftToStructuredError(error))
		} else {
			await this.testObserver.onStepPassed(this, step)
		}

		await this.testObserver.afterStep(this, step)

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
		if (this.settings.actionDelay <= 0 || command === 'wait') {
			return
		}

		const step: Step = browser.customContext
		this.testObserver.beforeStepAction(this, step, command)

		debug(`Before action: '${command}()' waiting on actionDelay: ${this.settings.actionDelay}`)
		await new Promise(resolve => {
			// TODO fix default
			setTimeout(resolve, this.settings.actionDelay * 1e3 || DEFAULT_ACTION_WAIT_SECONDS * 1e3)
		})
	}

	async didRunCommand(browser: Browser<Step>, command: string) {
		this.testObserver.afterStepAction(this, browser.customContext, command)
	}

	public async takeScreenshot(options?: ScreenshotOptions): Promise<string[]> {
		if (this.runningBrowser === null) {
			return []
		}

		await this.runningBrowser.takeScreenshot(options)
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
		return new ObjectTrace(this.runEnv.workRoot, step.name)
	}

	public async syncNetworkRecorder() {
		await this.networkRecorder.sync()
	}
}
