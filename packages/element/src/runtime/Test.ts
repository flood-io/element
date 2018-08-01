import { VM } from './VM'
import NetworkRecorder from '../network/Recorder'
import Observer from './Observer'
import { Browser } from './Browser'

import { IReporter } from './../Reporter'
import { NullReporter } from './../reporter/Null'
import { ObjectTrace } from '../utils/ObjectTrace'

import { TestObserver, ComposedTestObserver } from './test-observers/Observer'
import TimingObserver from './test-observers/Timing'
import TracingObserver from './test-observers/Tracing'

import { Step } from './Step'

import { PuppeteerClient, RuntimeEnvironment } from '../types'
import { ITestScript } from '../TestScript'
import { TestSettings, ResponseTiming, ConsoleMethod } from '../../index'
import CustomDeviceDescriptors from '../utils/CustomDeviceDescriptors'
// import { ScreenshotOptions } from 'puppeteer'

import { TestData } from '../test-data/TestData'
import { TestDataLoaders } from '../test-data/TestDataLoaders'

// import { readdirSync } from 'fs'
import * as debugFactory from 'debug'

// Waits is seconds
export const DEFAULT_STEP_WAIT_SECONDS = 5
export const DEFAULT_ACTION_WAIT_SECONDS = 0.5

export interface ConcreteTestSettings extends TestSettings {
	duration: number
	loopCount: number
	actionDelay: number
	stepDelay: number
	screenshotOnFailure: boolean
	clearCookies: boolean
	clearCache: boolean
	waitTimeout: number
	responseTimeMeasurement: ResponseTiming
	consoleFilter: ConsoleMethod[]
	userAgent: string
	device: string
	ignoreHTTPSErrors: boolean
}

export const DEFAULT_SETTINGS: ConcreteTestSettings = {
	duration: -1,
	loopCount: Infinity,
	actionDelay: 2,
	stepDelay: 6,
	screenshotOnFailure: true,
	clearCookies: true,
	clearCache: false,
	waitTimeout: 30,
	responseTimeMeasurement: 'step',
	consoleFilter: [],
	userAgent: CustomDeviceDescriptors['Chrome Desktop Large'].userAgent,
	device: 'Chrome Desktop Large',
	ignoreHTTPSErrors: false,
}

const debug = debugFactory('element:test')

export interface Assertion {
	message: string
	assertionName: string
	stack?: string[]
	isFailure: boolean
}

export default class Test {
	public vm: VM
	public settings: ConcreteTestSettings
	public steps: Step[]

	public networkRecorder: NetworkRecorder
	public observer: Observer

	public testObserver: TestObserver

	public iteration: number = 0

	public script: ITestScript
	public failed: boolean

	private driver: PuppeteerClient

	private testData: TestData<any>
	private testDataLoaders: TestDataLoaders<any>

	get skipping(): boolean {
		return this.failed
	}

	constructor(private runEnv: RuntimeEnvironment, public reporter: IReporter = new NullReporter()) {
		this.testObserver = new ComposedTestObserver(new TimingObserver(), new TracingObserver())

		this.testDataLoaders = new TestDataLoaders(runEnv.workRoot)
		this.testData = this.testDataLoaders.fromData([{}]).circular()
	}

	public enqueueScript(script: ITestScript): ConcreteTestSettings {
		this.script = script

		this.vm = new VM(this.runEnv, script)

		try {
			let { settings, steps } = this.vm.evaluate()
			this.settings = settings
			this.steps = steps

			// Adds output for console in script
			this.vm.bindReporter(this.reporter)
		} catch (err) {
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
		await this.vm.loadTestData()

		try {
			const browser = new Browser<Step>(
				this.runEnv.workRoot,
				this.driver,
				this.settings,
				this.willRunCommand.bind(this),
				this.didRunCommand.bind(this),
			)

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

				if (this.skipping) {
					await this.runStepAsSkipped(step)
				} else {
					await this.runStep(browser, step, testDataRecord)
				}
			}
		} catch (err) {
			// TODO: Cancel future steps if we reach here
			throw err
		}

		await this.testObserver.after(this)
	}

	async runStep(browser: Browser<Step>, step: Step, testDataRecord: any) {
		let error: Error | null = null
		await this.testObserver.beforeStep(this, step)
		try {
			debug(`Run step: ${step.name} ${step.fn.toString()}`)

			browser.settings = { ...this.settings, ...step.stepOptions }
			await step.fn.call(null, browser, testDataRecord)
		} catch (err) {
			error = err
		}

		await this.testObserver.afterStep(this, step)
		if (error !== null) {
			this.failed = true
			await this.testObserver.onStepError(this, step, error)
		} else {
			await this.testObserver.onStepPassed(this, step)
			await this.doStepDelay()
		}
	}

	async runStepAsSkipped(step: Step) {
		debug(`Skipping step: ${step.name}`)
		await this.testObserver.beforeStep(this, step)
		// this.skipped.push(step.name)
		await this.testObserver.afterStep(this, step)
		await this.testObserver.onStepSkipped(this, step)
	}

	public get stepNames(): string[] {
		return this.vm.stepNames
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

	// private async takeScreenshot(options?: ScreenshotOptions): Promise<string[]> {
	// if (this.vm.currentBrowser) {
	// await this.vm.currentBrowser.takeScreenshot(options)
	// return this.vm.currentBrowser.fetchScreenshots()
	// }
	// return []
	// }

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
