import { VM, CallbackQueue } from './VM'
import { expect } from '../utils/Expect'
import { IReporter, TestEvent, NetworkTraceData, CompoundMeasurement } from './../Reporter'
import { NullReporter } from './../reporter/Null'
import Observer from './Observer'
import NetworkRecorder from '../network/Recorder'
import { ObjectTrace } from '../utils/ObjectTrace'
import { readdirSync } from 'fs'
import { ITestScript } from '../TestScript'
import { TestSettings } from '../../index'
import * as debugFactory from 'debug'
import { PuppeteerClient, RuntimeEnvironment } from '../types'
import { ScreenshotOptions } from 'puppeteer'
import { serializeResponseHeaders, serializeRequestHeaders } from '../utils/headerSerializer'

// Waits is seconds
export const DEFAULT_STEP_WAIT_SECONDS = 5
export const DEFAULT_ACTION_WAIT_SECONDS = 0.5

const debug = debugFactory('element:test')
const debugTiming = debugFactory('element:test:timing')

const measurementKeysForDOM = {
	'first-contentful-paint': 'first_contentful_paint',
	'first-paint': 'first_paint',
}

export interface Assertion {
	message: string
	assertionName: string
	stack?: string[]
	isFailure: boolean
}

type TimingPair = [number, number]
type TimingSegmentName = 'beforeStep' | 'step' | 'afterStep'

class Timing {
	private segments: Map<string, TimingPair>
	constructor(public epoch: Date = new Date()) {
		this.segments = new Map()
	}

	start(segmentName: TimingSegmentName) {
		let now = new Date().valueOf()
		this.segments.set(segmentName, [now, 0])
	}

	end(segmentName: TimingSegmentName) {
		let [start] = expect(
			this.segments.get(segmentName),
			`No timing pair started for ${segmentName}`,
		)
		let now = new Date().valueOf()
		this.segments.set(segmentName, [start, now])
	}

	getDurationForSegment(segmentName: TimingSegmentName): number {
		let [start, end] = expect(
			this.segments.get(segmentName),
			`No timing pair started for ${segmentName}`,
		)
		return end - start
	}

	reset() {
		this.segments.clear()
	}
}

export default class Test {
	public networkRecorder: NetworkRecorder
	public observer: Observer
	public vm: VM
	public settings: TestSettings
	public iteration: number = 0
	public testTiming: Timing

	private script: ITestScript
	public trace: ObjectTrace
	public passed: number = 0
	public failed: number = 0
	public failedSteps: number = 0
	private thinkTime: number = 0
	private driver: PuppeteerClient

	constructor(private runEnv: RuntimeEnvironment, public reporter: IReporter = new NullReporter()) {
		this.testTiming = new Timing()
	}

	public enqueueScript(script: ITestScript): TestSettings {
		this.script = script
		return this.prepare()
	}

	public attachDriver(driver: PuppeteerClient) {
		console.assert(driver, `Driver is not defined`)
		console.assert(!this.driver, `Driver already attached`)

		this.driver = driver
		this.networkRecorder = new NetworkRecorder(driver.page)
		this.observer = new Observer(this.networkRecorder)
		// Adds filter for console messages emitted by the browser
		this.observer.consoleFilters = this.settings.consoleFilter || []
	}

	/**
	 * Runs the group of steps
	 * @return {Promise<void|Error>}
	 */
	public async run(iteration?: number): Promise<void | Error> {
		console.assert(this.driver, `Driver is not configured in Test`)
		return this.vm.execute(this.driver)
	}

	public prepare(): TestSettings {
		this.vm = new VM(
			this.runEnv,
			expect(this.script, `You must call enqueueScript() before prepare()`),
		)
		this.vm.on(CallbackQueue.BeforeStep, (name: string) => this.beforeStep(name))
		this.vm.on(CallbackQueue.StepSuccess, (name: string) => this.stepSucceeded(name))
		this.vm.on(CallbackQueue.AfterStep, (name: string, screenshots: string[]) =>
			this.afterStep(name, screenshots),
		)
		this.vm.on(CallbackQueue.BeforeAction, this.beforeStepAction.bind(this))
		this.vm.on(CallbackQueue.AfterAction, this.afterStepAction.bind(this))
		this.vm.on(CallbackQueue.Error, this.stepFailure.bind(this))
		this.vm.on(CallbackQueue.PrepareStep, this.prepareStep.bind(this))
		this.vm.on(CallbackQueue.Skip, (name: string) => this.stepSkipped(name))

		try {
			this.settings = this.vm.evaluate()
			// Adds output for console in script
			this.vm.attachReporterToConsole(this.reporter)
		} catch (err) {
			throw this.script.maybeLiftError(err)
		}

		return this.settings
	}

	public get stepNames(): string[] {
		return this.vm.stepNames
	}

	/**
	 * Public callback before all steps are run
	 *
	 * @memberof Test
	 */
	public async before(): Promise<void> {
		debug('beforeTest')
		console.assert(this.observer, `You must call attachDriver() before before() hook`)
		this.resetState(undefined)
		this.reporter.testLifecycle(TestEvent.BeforeTest, 'test')
		await this.observer.attach()
		await this.vm.loadTestData()
	}

	public async after(): Promise<void> {
		if (this.failedSteps > 0) {
			debug('testFailed')
			this.reporter.testLifecycle(TestEvent.TestFailed, 'test')
		} else {
			debug('TestSucceeded')
			this.reporter.testLifecycle(TestEvent.TestSucceeded, 'test')
		}

		debug('afterTest')
		this.reporter.testLifecycle(TestEvent.AfterTest, 'test')

		if (this.networkRecorder) await this.networkRecorder.pendingTaskQueue.chain
	}

	protected async beforeStepAction(command: string): Promise<void> {
		await this.measureCallback(async () => {
			this.reporter.testLifecycle(TestEvent.BeforeStepAction, command)

			debug(`Before action: '${command}()' waiting on networkRecorder.pendingTaskQueue`)
			if (this.networkRecorder) await this.networkRecorder.pendingTaskQueue.chain
			if (this.settings.actionDelay && this.settings.actionDelay > 0 && command !== 'wait') {
				debug(`Before action: '${command}()' waiting on actionDelay: ${this.settings.actionDelay}`)
				await new Promise(resolve => {
					setTimeout(resolve, this.settings.actionDelay * 1e3 || DEFAULT_ACTION_WAIT_SECONDS * 1e3)
				})
			}
		})
	}

	protected async afterStepAction(name: string): Promise<void> {
		await this.measureCallback(async () => {
			this.reporter.testLifecycle(TestEvent.AfterStepAction, name)
			debug(`After action: ${name}`)
			// Force reporting concurrency to ensure steps which take >15s don't skew metrics
			this.reporter.addMeasurement('concurrency', this.numberOfBrowsers, name)
		})
	}

	protected async beforeStep(name) {
		this.testTiming.start('beforeStep')
		this.resetState(name)

		this.reporter.testLifecycle(TestEvent.BeforeStep, name)
		this.testTiming.end('beforeStep')
		this.testTiming.start('step')
		this.thinkTime = 0
		debug(`Before step: ${name}`)
	}

	protected async afterStep(name: string, screenshots?: string[]) {
		this.testTiming.end('step')
		this.testTiming.start('afterStep')

		await this.networkRecorder.pendingTaskQueue.chain

		this.reporter.testLifecycle(TestEvent.AfterStep, name)
		debug(`After step: ${name}`)

		screenshots.forEach(file => this.trace.addScreenshot(file))
		await this.reportResult(name)

		this.testTiming.end('afterStep')

		if (this.settings.stepDelay && this.settings.stepDelay > 0) {
			await new Promise(resolve => {
				if (!this.settings.stepDelay) {
					resolve()
					return
				}
				setTimeout(resolve, this.settings.stepDelay * 1e3 || DEFAULT_STEP_WAIT_SECONDS * 1e3)
			})
		}
		this.testTiming.reset()
	}

	protected async stepSucceeded(name: string): Promise<void> {
		this.reporter.testLifecycle(TestEvent.StepSucceeded, name)
		this.passed++
	}

	protected async stepFailure(err: Error, stepName: string) {
		debug('stepFailure', stepName)

		this.failed++
		this.failedSteps++
		this.settings.stepDelay = 0

		if (err.message.includes('Protocol error')) {
			debug('stepFailure - protocol error', stepName, err)
			this.reporter.testInternalError('Protocol Error', err)
		} else if (err.name.startsWith('AssertionError')) {
			debug('stepFailure - assertion', stepName, err)
			// Handles assertions from assert
			let { message, stack } = err

			let assertion: Assertion = {
				assertionName: 'AssertionError',
				message,
				stack: this.script.filterAndUnmapStack(stack),
				isFailure: true,
			}

			this.reporter.testAssertionError(this.script.liftError(err))
			this.trace.addAssertion(assertion)
		} else {
			debug('stepFailure - other in test step', stepName, err)
			this.reporter.testStepError(this.script.liftError(err))

			let errorPayload = {
				message: err.message,
				stack: this.script.filterAndUnmapStack(err.stack).join('\n'),
			}

			this.trace.addError(errorPayload)
		}

		// Take a screenshot on failure
		if (this.settings.screenshotOnFailure) {
			let screenshots = await this.takeScreenshot()
			screenshots.forEach(file => this.trace.addScreenshot(file))
		}

		this.reporter.testLifecycle(TestEvent.StepFailed, stepName)
	}

	protected async stepSkipped(name) {
		this.reporter.testLifecycle(TestEvent.StepSkipped, name)
		debug(`Skipped step: ${name}`)
	}

	private async reportResult(name: string): Promise<void> {
		expect(name == this.reporter.stepName, 'reporting this step')

		await this.networkRecorder.pendingTaskQueue.chain

		debug(`Report Result: ${name}`)

		let responseCode = String(this.networkRecorder.documentResponseCode || 0)
		let documentResponseTime = this.getResponseTimeMeasurement(this.networkRecorder)
		let documentLatency = this.networkRecorder.latencyForType('Document')

		this.reporter.responseCode = responseCode

		// console.log(`Report: Document Response Time: ${documentResponseTime}ms`)
		// console.log(`Report: Document Latency: ${documentLatency}ms`)

		// TODO decouple
		let tti = await this.vm.currentBrowser.interactionTiming()
		let performanceTiming = await this.vm.currentBrowser.performanceTiming()

		let browserPerformanceTiming: CompoundMeasurement = {
			time_to_first_interactive: tti,
			dom_interactive: performanceTiming.domInteractive - performanceTiming.navigationStart,
			dom_complete: performanceTiming.domComplete - performanceTiming.navigationStart,
		}

		let paintTimingEntries = await this.vm.currentBrowser.paintTiming()
		paintTimingEntries.forEach(entry => {
			if (measurementKeysForDOM[entry.name]) {
				browserPerformanceTiming[measurementKeysForDOM[entry.name]] = Math.round(entry.startTime)
			}
		})

		this.reporter.addCompoundMeasurement('browser_performance', browserPerformanceTiming, name)
		this.reporter.addMeasurement('throughput', this.networkRecorder.networkThroughput(), name)
		this.reporter.addMeasurement('transaction_rate', 1, name)
		this.reporter.addMeasurement('concurrency', this.numberOfBrowsers, name)
		this.reporter.addMeasurement('passed', this.passed, name)
		this.reporter.addMeasurement('failed', this.failed, name)
		this.reporter.addMeasurement('response_time', documentResponseTime, name)
		this.reporter.addMeasurement('latency', documentLatency, name)

		await this.addNetworkTrace(name, this.networkRecorder)
		// console.log('Trace', this.trace.toObject())
		if (this.trace.isEmpty) {
		} else {
			await this.reporter.addTrace(this.trace.toObject(), name)
		}

		await this.reporter.flushMeasurements()

		this.afterReportResult()
	}

	private getResponseTimeMeasurement(networkRecorder: NetworkRecorder): number {
		let { responseTimeMeasurement } = this.settings

		if (responseTimeMeasurement === 'page') {
			return networkRecorder.responseTimeForType('Document')
		} else if (responseTimeMeasurement === 'network') {
			return networkRecorder.meanResponseTime()
		} else if (responseTimeMeasurement === 'step') {
			let value = this.testTiming.getDurationForSegment('step') - this.thinkTime
			debugTiming(`Step Timing: thinking=${this.thinkTime} ms, interaction: ${value} ms`)
			return value
		} else if (responseTimeMeasurement === 'stepWithThinkTime') {
			let value = this.testTiming.getDurationForSegment('step')
			debugTiming(`Step Timing: thinking=${this.thinkTime} ms, step: ${value} ms`)
			return value
		}
	}

	private afterReportResult() {
		// Reset everything for reporting next step
		this.networkRecorder.reset()
		this.thinkTime = 0
	}

	private resetState(stepName: string) {
		this.trace = new ObjectTrace(this.runEnv.workRoot, stepName)
		this.passed = 0
		this.failed = 0
		this.reporter.reset(stepName)
	}

	private async prepareStep(name: string) {
		this.reporter.reset(name)
		this.reporter.addMeasurement('response_time', 0, name)
		this.reporter.addMeasurement('latency', 0, name)
		this.reporter.addMeasurement('concurrency', this.numberOfBrowsers, name)
		this.reporter.addMeasurement('passed', 1, name)
		this.reporter.addMeasurement('failed', 0, name)
	}

	private async addNetworkTrace(label: string, networkRecorder: NetworkRecorder) {
		let [document] = networkRecorder.entriesForType('Document')

		let responseHeaders = '',
			requestHeaders = '',
			sourceHost = '',
			startTime = new Date().valueOf(),
			endTime = new Date().valueOf(),
			responseData = ''

		let url = this.vm.currentBrowser.url

		if (document) {
			responseHeaders = serializeResponseHeaders(document)
			requestHeaders = serializeRequestHeaders(document)
			sourceHost = document.serverIPAddress

			startTime = document.request.timestamp
			endTime = document.response.timestamp
			// url = document.request.url

			if (document.response.content)
				responseData = document.response.content.text.slice(0, 32 * 1024)
		} else {
			// Don't do anything if we don't have a document to trace
			return
		}

		let traceData: NetworkTraceData = {
			op: 'network',
			label,
			sampleCount: 1,
			errorCount: this.failed,
			startTime,
			endTime,
			url,
			requestHeaders,
			responseHeaders,
			responseData,
			sourceHost,
		}

		await this.trace.addNetworkTrace(traceData)
	}
	private async takeScreenshot(options?: ScreenshotOptions): Promise<string[]> {
		if (this.vm.currentBrowser) {
			await this.vm.currentBrowser.takeScreenshot(options)
			return this.vm.currentBrowser.fetchScreenshots()
		}
	}

	private get numberOfBrowsers() {
		try {
			let lockFiles = readdirSync('/test/lock')
			return lockFiles.length
		} catch (err) {
			return 1
		}
	}

	private async measureCallback(func: Function, ...args: any[]) {
		let start = new Date()
		await func.apply(this, ...args)
		let end = new Date()
		this.thinkTime += end.valueOf() - start.valueOf()
	}
}
