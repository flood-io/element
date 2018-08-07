import { StructuredError } from '../../utils/StructuredError'
import { ITestScript, TestScriptError } from '../../TestScript'
import { DocumentedError } from '../../utils/DocumentedError'
import { AnyErrorData, NetworkErrorData, ActionErrorData } from '../../runtime/errors/Types'
import chalk from 'chalk'

import * as debugFactory from 'debug'
const debug = debugFactory('element:test:errordoc')

function liftWithDoc(
	script: ITestScript,
	error: Error,
	message: string,
	doc: string,
	callContext?: string,
): TestScriptError {
	// TODO get callContext from og error if it exists
	return script.liftError(DocumentedError.documented(error, message, doc, callContext))
}

const documentationNeeded =
	'Documentation needed! Please report this at https://github.com/flood-io/element/issues so that we can improve Element!'

export function structuredErrorToDocumentedError(
	sErr: StructuredError<AnyErrorData>,
	script: ITestScript,
): TestScriptError {
	debug('ERROR to map %O', sErr)

	// it was a wrapped unstructured error.
	// We can't really do much, but ask for help in reporting for improvement
	if (sErr.wrappedUnstructured) {
		return liftWithDoc(script, sErr, sErr.message, documentationNeeded, sErr.callContext)
	}

	// delegate out to the various type handlers
	if (sErr.data._kind === 'net') {
		return script.liftError(netError(<StructuredError<NetworkErrorData>>sErr))
	}
	if (sErr.data._kind === 'action') {
		return script.liftError(actionError(<StructuredError<ActionErrorData>>sErr))
	}

	// nothing else worked
	return liftWithDoc(script, sErr, sErr.message, documentationNeeded, sErr.callContext)
}

function netError(err: StructuredError<NetworkErrorData>): DocumentedError {
	const { kind, subKind, url } = err.data

	if (kind === 'net' && subKind == 'not-resolved') {
		return DocumentedError.documented(
			err,
			`Unable to resolve DNS for ${url}`,
			`Element tried to load The URL ${url} but it didn't resolve in DNS. This may be due to TODO`,
		)
	}

	if (kind === 'http' && subKind === 'not-ok') {
		return DocumentedError.documented(
			err,
			`Unable to visit ${url}`,
			`Element tried to visit The URL ${url} but it responded with status code ${
				err.data.code
			}. Element expected a response code 200-299.`,
		)
	}

	return DocumentedError.documented(
		err,
		`An unknown net error occurred: ${err.message} (kind: ${kind} / subKind: ${subKind})`,
		documentationNeeded,
	)
}

function actionError(err: StructuredError<ActionErrorData>): DocumentedError {
	const { kind, action } = err.data
	if (kind === 'execution-context-destroyed') {
		return DocumentedError.documented(
			err,
			`Unable to perform ${action}, most likely due to page navigation.`,
			chalk`The test script tried to perform a {blue ${action}} action on an element whose puppeteer ExecutionContext was destroyed. 

This can occur when the browser navigates to a new page, and we try to perform an action on an element located on the previous page.

Things to try to fix:
- TODO
`,
		)
	}

	if (kind === 'node-detached') {
		return DocumentedError.documented(
			err,
			`Unable to perform ${action} on detached element.`,
			chalk`The test script tried to perform a {blue ${action}} action on an element that has been removed from the DOM tree.
      
This can occur when the page changes between the time you locate the element and when you use it.

Things to try to fix:
- TODO
      `,
		)
	}

	return DocumentedError.documented(
		err,
		`An unknown action error occurred: ${err.message} (kind: ${kind})`,
		documentationNeeded,
	)
}
