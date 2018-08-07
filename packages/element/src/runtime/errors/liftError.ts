import { ITestScript } from '../../TestScript'
import { StructuredError } from '../../utils/StructuredError'

import * as debugFactory from 'debug'
const debug = debugFactory('element:lift-error')

interface EmptyData {
	_kind: 'empty'
}

export default function liftToStructuredError<T extends EmptyData>(
	err: Error,
	liftSource: string,
	testScript?: ITestScript,
): StructuredError<T> {
	debug('liftToStructuredError %O', err)
	// its already structured
	if ((<StructuredError<T>>err)._structured === 'yes') {
		return <StructuredError<T>>err
	}

	// catchall - this should trigger a documentation request further up the chain
	return StructuredError.wrapBareError<T>(err, { _kind: 'empty' } as T, liftSource)
}
