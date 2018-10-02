import Test from '../Test'
import { Step } from '../Step'
import { StructuredError } from '../../utils/StructuredError'
import { NoOpTestObserver } from './Observer'
import { structuredErrorToDocumentedError } from '../errors/Documentation'
import { AnyErrorData } from '../errors/Types'

// import * as debugFactory from 'debug'
// const debug = debugFactory('element:test:errors')

export default class ErrorObserver extends NoOpTestObserver {
	async onStepError(test: Test, step: Step, err: StructuredError<AnyErrorData>) {
		// TODO handle errors sourced from without the script
		test.reporter.testStepError(structuredErrorToDocumentedError(err, test.script))

		return this.next.onStepError(test, step, err)
	}
}
