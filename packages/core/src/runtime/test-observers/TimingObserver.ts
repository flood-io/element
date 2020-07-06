import debugFactory from 'debug'
import { NetworkRecordingTestObserver } from './NetworkRecordingTestObserver'
import { Timing } from './Timing'
import Test from '../Test'
import { Step } from '../Step'
import { StructuredError } from '../../utils/StructuredError'
import { ResponseTiming } from '../Settings'
import NetworkRecorder from '../../network/Recorder'
import { expect } from '../../utils/Expect'
const debug = debugFactory('element:grid:timing')

export class TimingObserver extends NetworkRecordingTestObserver {
	private passed = 0
	private failed = 0
	private timing: Timing = new Timing()

	/**
	 * Public callback before all steps are run
	 *
	 * @memberof Test
	 */
	async before(test: Test): Promise<void> {
		return this.next.before(test)
	}

	public async after(test: Test): Promise<void> {
		return this.next.after(test)
	}

	async beforeStep(test: Test, step: Step) {
		debug('beforeStep')
		this.timing.reset()
		this.passed = 0
		this.failed = 0
		this.timing.start('beforeStep')

		const name = step.name
		const reporter = test.reporter

		await this.next.beforeStep(test, step)

		reporter.reset(name)

		this.timing.end('beforeStep')
		this.timing.start('step')
		debug(`Before step: ${name}`)
	}

	async afterStep(test: Test, step: Step) {
		this.timing.end('step')
		this.timing.start('afterStep')

		await this.syncNetworkRecorder()

		debug(`After step: ${step.name}`)

		await this.next.afterStep(test, step)

		await this.reportResult(test, step)

		this.timing.end('afterStep')
	}

	async onStepPassed(test: Test, step: Step): Promise<void> {
		this.passed++
		return this.next.onStepPassed(test, step)
	}

	async onStepError(test: Test, step: Step, err: StructuredError<any>) {
		this.failed++
		return this.next.onStepError(test, step, err)
	}

	async beforeStepAction(test: Test, step: Step, action: string): Promise<void> {
		await this.timing.measureThinkTime('step', async () => {
			debug(`Before action: '${action}()' waiting on networkRecorder sync`)
			await this.syncNetworkRecorder()
			await this.next.beforeStepAction(test, step, action)
		})
	}

	async afterStepAction(test: Test, step: Step, action: string): Promise<void> {
		await this.timing.measureThinkTime('step', async () => {
			debug(`After action: ${action}`)
			// Force reporting concurrency to ensure steps which take >15s don't skew metrics
			// this.reporter.addMeasurement('concurrency', this.numberOfBrowsers, name)
			await this.next.afterStepAction(test, step, action)
		})
	}

	async onStepSkipped(test: Test, step: Step) {
		debug(`Skipped step: ${step.name}`)
		return this.next.onStepSkipped(test, step)
	}

	private async reportResult(test: Test, step: Step): Promise<void> {
		if (test.runningBrowser === null) {
			debug('reportResult: no running browser')
			return
		}

		const reporter = test.reporter
		const name = step.name

		expect(name == reporter.stepName, 'reporting this step')

		await this.syncNetworkRecorder()

		const { networkRecorder } = this.ctx

		if (networkRecorder) {
			debug(`Report Result: ${name}`)

			const responseCode = String(networkRecorder.documentResponseCode || 0)
			const documentResponseTime = this.getResponseTimeMeasurement(
				test.settings.responseTimeMeasurement,
				networkRecorder,
			)
			const documentLatency = networkRecorder.latencyForType('Document')

			test.reporter.responseCode = responseCode

			// console.log(`Report: Document Response Time: ${documentResponseTime}ms`)
			// console.log(`Report: Document Latency: ${documentLatency}ms`)

			// NOTE all browser_performance metrics will be decoupled
			// TODO decouple
			// const browser = test.runningBrowser
			// let tti = await browser.interactionTiming()
			// let performanceTiming = await browser.performanceTiming()

			// let browserPerformanceTiming: CompoundMeasurement = {
			// time_to_first_interactive: tti,
			// dom_interactive: performanceTiming.domInteractive - performanceTiming.navigationStart,
			// dom_complete: performanceTiming.domComplete - performanceTiming.navigationStart,
			// }

			// let paintTimingEntries = await browser.paintTiming()
			// paintTimingEntries.forEach(entry => {
			// if (measurementKeysForDOM[entry.name]) {
			// browserPerformanceTiming[measurementKeysForDOM[entry.name]] = Math.round(entry.startTime)
			// }
			// })

			// reporter.addCompoundMeasurement('browser_performance', browserPerformanceTiming, name)

			reporter.addMeasurement('throughput', networkRecorder.networkThroughput(), name)
			reporter.addMeasurement('response_time', documentResponseTime, name)
			reporter.addMeasurement('latency', documentLatency, name)
		}

		reporter.addMeasurement('transaction_rate', 1, name)
		// reporter.addMeasurement('concurrency', 1, name) //TODO see whether concurrency changes in go grid work with this
		reporter.addMeasurement('passed', this.passed, name)
		reporter.addMeasurement('failed', this.failed, name)

		await reporter.flushMeasurements()
	}

	async getMeasurementTime(responseTiming: ResponseTiming): Promise<number> {
		await this.syncNetworkRecorder()
		const { networkRecorder } = this.ctx
		return this.getResponseTimeMeasurement(responseTiming, networkRecorder)
	}

	getResponseTimeMeasurement(
		responseTimeMeasurement: ResponseTiming,
		networkRecorder: NetworkRecorder,
	): number {
		switch (responseTimeMeasurement) {
			case 'page':
				return networkRecorder.responseTimeForType('Document')
			case 'network':
				return networkRecorder.meanResponseTime()
			case 'step': {
				const value = this.timing.getDurationWithoutThinkTimeForSegment('step')
				const thinkTime = this.timing.getThinkTimeForSegment('step')
				debug(`Step Timing: thinking=${thinkTime} ms, interaction: ${value} ms`)
				return value
			}
			case 'stepWithThinkTime': {
				const value = this.timing.getDurationForSegment('step')
				const thinkTime = this.timing.getThinkTimeForSegment('step')
				debug(`Step Timing: thinking=${thinkTime} ms, step: ${value} ms`)
				return value
			}
			default:
				return 0
		}
	}
}
