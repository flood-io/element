import Test from '../Test'
import { Step } from '../Step'
import { NoOpTestObserver, NextFunction } from './Observer'
import { serializeResponseHeaders, serializeRequestHeaders } from '../../utils/headerSerializer'
import { NetworkTraceData } from '../../Reporter'
import { IObjectTrace, NullObjectTrace } from '../../utils/ObjectTrace'

export default class TracingObserver extends NoOpTestObserver {
	private trace: IObjectTrace = NullObjectTrace
	private failed: number = 0

	async beforeStep(test: Test, step: Step, next: NextFunction) {
		this.failed = 0
		this.trace = test.newTrace(step)
		return next()
	}

	async afterStep(test: Test, step: Step, next: NextFunction) {
		screenshots.forEach(file => this.trace.addScreenshot(file))

		await this.addNetworkTrace(name, test.networkRecorder)
		// console.log('Trace', this.trace.toObject())
		if (this.trace.isEmpty) {
		} else {
			await this.reporter.addTrace(this.trace.toObject(), name)
		}
	}

	async onStepError(test: Test, step: Step, err: Error) {
		this.failed++

		if (err.name.startsWith('AssertionError')) {
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
			let errorPayload = {
				message: err.message,
				stack: this.script.filterAndUnmapStack(err.stack).join('\n'),
			}

			this.trace.addError(errorPayload)
		}

		// Take a screenshot on failure
		// TODO
		if (this.settings.screenshotOnFailure) {
			let screenshots = await this.takeScreenshot()
			screenshots.forEach(file => this.trace.addScreenshot(file))
		}
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
}
