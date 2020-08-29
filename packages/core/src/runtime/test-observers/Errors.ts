import { Test } from './testTypes'
import { Step } from '../Step'
import { StructuredError } from '../../utils/StructuredError'
import { NoOpTestObserver } from './Observer'
import { structuredErrorToDocumentedError } from '../errors/Documentation'
import { AnyErrorData } from '../errors/Types'

export default class ErrorObserver extends NoOpTestObserver {
	async onStepError(test: Test, step: Step, err: StructuredError<AnyErrorData>) {
		// TODO handle errors sourced from without the script
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		test.reporter.testStepError(structuredErrorToDocumentedError(err, test.script)!)

		if (test.settings.screenshotOnFailure) {
			await test.runningBrowser?.takeScreenshot()
		}

		return this.next.onStepError(test, step, err)
	}
}
