import { ITestScript } from '../../TestScript'

import * as debugFactory from 'debug'
const debug = debugFactory('element:test:error')

export type ErrorKind = 'assertion' | 'protocol' | 'browser' | 'internal'
export type ErrorSource = 'element' | 'testScript'

export interface ClassifiedError {
	kind: ErrorKind
	source: ErrorSource
	sourceError: Error
}

export function classifyError(error: Error, testScript?: ITestScript): ClassifiedError {
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
