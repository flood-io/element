import { ITestScript } from '../../TestScript'
import { StructuredError } from '../../utils/StructuredError'

import * as debugFactory from 'debug'
const debug = debugFactory('element:lift-error')

interface EmptyData {}

export default function liftError<T extends EmptyData>(
	err: Error,
	liftSource: string,
	testScript?: ITestScript,
): StructuredError<T> {
	debug('err %O', err)
	if ((<StructuredError<T>>err)._structured === 'yes') {
		return <StructuredError<T>>err
	}

	return StructuredError.wrapBareError<T>(err, liftSource, 'unknown', {} as T)
}
