import { expect } from 'chai'
import 'mocha'
import { ActionErrorData } from '../../runtime/errors/Types'
import { StructuredError } from '../../utils/StructuredError'
import { ITestScript, compileString } from '../../TestScript'

import { structuredErrorToDocumentedError } from './Documentation'

let testScript: ITestScript

describe('Documentation', () => {
	before(async () => {
		testScript = await compileString(`console.log("hi")`, 'test.ts')
	})
	describe('structuredErrorToDocumentedError', () => {
		describe('actionError', () => {
			it('works', () => {
				const originalErr = new Error('hi')
				const actionError = new StructuredError<ActionErrorData>(
					'dom error during action',
					{
						_kind: 'action',
						action: 'somekey',
						kind: 'node-detached',
					},
					originalErr,
				)

				const docErr = structuredErrorToDocumentedError(actionError, testScript)
				expect(docErr.message).to.have.string('somekey on detached element')
				expect(docErr.errorDoc).to.have.string('removed from the DOM')
				// console.log(docErr)
			})
		})
	})
})
