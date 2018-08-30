import { ITestScript } from '../../TestScript'

import * as debugFactory from 'debug'
const debug = debugFactory('element:test:error')

export type ErrorKind = 'assertion' | 'protocol' | 'browser' | 'internal'
export type ErrorSource = 'element' | 'testScript'

export interface ErrorClassification {
	kind: ErrorKind
	source: ErrorSource
}

type ClassifiedError<T> = T & ErrorClassification

export function classifyError<T>(error: Error, testScript?: ITestScript): ClassifiedError<T> {
	debug('input %O', error)
	debug('error.name %s', error.name)

	let source: ErrorSource = 'element'
	if (testScript && testScript.isScriptError(error)) {
		source = 'testScript'
	}

	let kind: ErrorKind = 'internal'
	if (error.name.startsWith('AssertionError')) {
		kind = 'assertion'
	} else if (error.name.startsWith('ElementNotFound') || error.name.startsWith('BrowserError')) {
		kind = 'browser'
	}

	debug('source: %s kind: %s', source, kind)

	return {
		kind,
		source,
		sourceError: error,
	}
}
