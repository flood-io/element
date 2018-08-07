import Test from '../Test'
import { Step } from '../Step'
import { StructuredError } from '../../utils/StructuredError'
import { NoOpTestObserver } from './Observer'
import { structuredErrorToDocumentedError } from '../errors/Documentation'

import * as debugFactory from 'debug'
const debug = debugFactory('element:test:errors')

export default class ErrorObserver extends NoOpTestObserver {
	async onStepError<T>(test: Test, step: Step, err: StructuredError<T>) {
		// TODO these don't fit here
		debug('stepFailure', step.name)

		// TODO handle errors sourced from without the script
		test.reporter.testStepError(structuredErrorToDocumentedError(err, test.script))

		// if (err.kind == 'browser') {
		// debug('stepFailure - browser error in test step', step.name, err)
		// } else {
		// debug('stepFailure - internal in test step', step.name, err)
		// // TODO add new reporter method
		// test.reporter.testStepError(test.script.liftError(err))
		// }

		return this.next.onStepError(test, step, err)
	}
}
