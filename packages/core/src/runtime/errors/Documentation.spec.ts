import { ActionErrorData } from '../../runtime/errors/Types'
import { StructuredError } from '../../utils/StructuredError'
import { compileString } from '../../TestScript'
import { ITestScript } from '../../interface/ITestScript'

import { structuredErrorToDocumentedError } from './Documentation'

let testScript: ITestScript

describe.skip('Documentation', () => {
	beforeAll(async () => {
		testScript = await compileString(`console.log("hi")`, 'test.ts')
	})
	describe('structuredErrorToDocumentedError', () => {
		describe('actionError', () => {
			test('works', () => {
				const originalErr = new Error('hi')
				const actionError = new StructuredError<ActionErrorData>(
					'dom error during action',
					{
						_kind: 'action',
						action: 'somekey',
						kind: 'node-detached',
					},
					originalErr
				)

				const docErr = structuredErrorToDocumentedError(actionError, testScript)
				expect(docErr?.message).toContain('somekey on detached element')
				expect(docErr?.errorDoc).toContain('removed from the DOM')
				// console.log(docErr)
			})
		})
	})
})
