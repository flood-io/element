import { StructuredError } from '../../utils/StructuredError'
import { ITestScript, TestScriptError } from '../../TestScript'
import { DocumentedError } from '../../utils/DocumentedError'
import { AssertionError } from 'assert'
import {
	AnyErrorData,
	AssertionErrorData,
	NetworkErrorData,
	ActionErrorData,
	LocatorErrorData,
	PuppeteerErrorData,
} from '../../runtime/errors/Types'
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
	switch (sErr.data._kind) {
		case 'assertion':
			return script.liftError(assertionError(<StructuredError<AssertionErrorData>>sErr))
		case 'net':
			return script.liftError(netError(<StructuredError<NetworkErrorData>>sErr))
		case 'action':
			return script.liftError(actionError(<StructuredError<ActionErrorData>>sErr))
		case 'locator':
			return script.liftError(locatorError(<StructuredError<LocatorErrorData>>sErr))
		case 'puppeteer':
			return script.liftError(puppeteerError(<StructuredError<PuppeteerErrorData>>sErr))
	}

	// nothing else worked
	return liftWithDoc(script, sErr, sErr.message, documentationNeeded, sErr.callContext)
}

function assertionError(err: StructuredError<AssertionErrorData>): DocumentedError {
	const assertionErr = err.originalError as AssertionError

	return DocumentedError.documented(
		err,
		`Assertion failed`,
		chalk`An assertion in the test script failed.

operator: {blue ${assertionErr.operator}}
expected: {green ${assertionErr.expected}}
actual  : {red ${assertionErr.actual}}
    `,
	)
}

function puppeteerError(err: StructuredError<PuppeteerErrorData>): DocumentedError {
	const { kind } = err.data

	if (kind === 'execution-context-destroyed') {
		return DocumentedError.documented(
			err,
			`Element tried to perform an action while the browser was navigating.`,
			`Sometimes your script may attempt to perform an action while the page isn't ready to process it (e.g. before the page has loaded).

Consider using browser.wait(Until.<condition>()) to ensure the page is in the state you expect before performing your action.

Example:
await browser.visit('example.com')
// Fetching the page title right after a visit may cause an error because the page title may not yet be loaded
// Worse, it may work sometimes and fail sometimes (known as a race condition)
// console.log(await browser.title())
//
// instead try:
await browser.wait(Until.titleContains('example corp'))
console.log('page title:', await browser.title())
      `,
		)
	}

	return DocumentedError.documented(
		err,
		`An unknown puppeteer error occurred: ${err.message} (kind: ${kind})`,
		documentationNeeded,
	)
}

function netError(err: StructuredError<NetworkErrorData>): DocumentedError {
	const { kind, subKind, url } = err.data

	if (kind === 'net' && subKind == 'not-resolved') {
		return DocumentedError.documented(
			err,
			`Unable to resolve DNS for ${url}`,
			`Element tried to load The URL ${url} but it didn't resolve in DNS. This may be due to
- a transient networking issue.
- misconfiguration of DNS, either locally or on your site.`,
		)
	}

	if (kind === 'http' && subKind === 'not-ok') {
		return DocumentedError.documented(
			err,
			`Unable to visit ${url}`,
			`Element tried to visit The URL ${url} but it responded with status code ${
				err.data.code
			}. Element expected a response code 200-299 or 300-399.`,
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

Consider using {blue browser.wait(Until.<condition>)} to ensure the page is in a known state before performing the action

Example:
let locator = By.css('.button')
await browser.wait(Until.elementIsVisible(locator))
await browser.click(locator, { button: MouseButtons.LEFT })
      `,
		)
	}

	return DocumentedError.documented(
		err,
		`An unknown action error occurred: ${err.message} (kind: ${kind})`,
		documentationNeeded,
	)
}

function locatorError(err: StructuredError<LocatorErrorData>): DocumentedError {
	const { kind, locator } = err.data
	if (kind === 'element-not-found') {
		return DocumentedError.documented(
			err,
			`Unable to find element using ${locator}.`,
			chalk`The test script tried to locate an element using {blue ${locator}} but it couldn't be found on the page.

Consider running your test script with --devtools to explore the page and determine the correct selector.
`,
		)
	}

	return DocumentedError.documented(
		err,
		`An unknown locator error occurred: ${err.message} (kind: ${kind})`,
		documentationNeeded,
	)
}
