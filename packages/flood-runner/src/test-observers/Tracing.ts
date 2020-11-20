import { serializeResponseHeaders, serializeRequestHeaders } from '../utils/headerSerializer'

import {
	Test,
	Step,
	Assertion,
	AssertionErrorData,
	castStructuredError,
	NetworkTraceData,
	IObjectTrace,
	NullObjectTrace,
	NetworkRecorder,
	StructuredError,
} from '@flood/element-api'
import { NetworkRecordingTestObserver } from '@flood/element-core'

import debugFactory from 'debug'
const debug = debugFactory('element:grid:tracing')

export class TracingObserver extends NetworkRecordingTestObserver {
	private trace: IObjectTrace = NullObjectTrace
	private failed = 0

	async beforeStep(test: Test, step: Step) {
		this.failed = 0
		this.trace = test.newTrace(step)
		return this.next.beforeStep(test, step)
	}

	async afterStep(test: Test, step: Step) {
		const screenshots = await test.fetchScreenshots()
		screenshots.forEach(file => this.trace.addScreenshot(file))

		await this.addNetworkTrace(test, step, this.ctx.networkRecorder)

		this.next.afterStep(test, step)

		return this.flushTrace(test, step)
	}

	async flushTrace(test: Test, step: Step) {
		console.log('flushing trace', this.trace.toObject())
		if (!this.trace.isEmpty) {
			await test.reporter.addTrace(this.trace.toObject(), step.name)
		}

		this.trace = NullObjectTrace
	}

	async onStepError<T>(test: Test, step: Step, err: StructuredError<T>) {
		this.failed++

		const sErr = castStructuredError<AssertionErrorData>(err, 'assertion')
		if (sErr) {
			debug('stepFailure - assertion', step.name, err)
			// Handles assertions from assert

			const assertion: Assertion = {
				assertionName: 'AssertionError',
				message: sErr.message,
				stack: test.script?.filterAndUnMapStack?.(sErr.stack) ?? 'No stack trace from script',
				isFailure: true,
			}

			this.trace.addAssertion(assertion)
			// TODO should return after handling
		} else {
			const errorPayload = {
				message: err.message,
				stack: test.script?.filterAndUnMapStack?.(err)?.join('\n') ?? 'No stack trace from script',
			}

			this.trace.addError(errorPayload)
		}

		// Take a screenshot on failure
		// TODO add screenshots to step
		if (test.settings.screenshotOnFailure) {
			await test.takeScreenshot()
		}

		return this.next.onStepError(test, step, err)
	}

	private async addNetworkTrace(test: Test, step: Step, networkRecorder: NetworkRecorder) {
		const [document] = networkRecorder.entriesForType('Document')

		// there may be no document if e.g. the step didn't cause any network activity
		if (!document) {
			debug('tracing.addNetworkTrace() - no document')
			return
		}

		let responseHeaders = '',
			requestHeaders = '',
			sourceHost = '',
			startTime = new Date().valueOf(),
			endTime = new Date().valueOf(),
			responseData = ''

		const url = test.currentURL

		responseHeaders = serializeResponseHeaders(document)
		requestHeaders = serializeRequestHeaders(document)
		sourceHost = document.serverIPAddress

		startTime = document.request.timestamp
		endTime = document.response.timestamp
		// url = document.request.url

		if (document.response.content) responseData = document.response.content.text.slice(0, 32 * 1024)

		const traceData: NetworkTraceData = {
			op: 'network',
			label: step.name,
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
