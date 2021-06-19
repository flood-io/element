import { ObjectTrace } from './ObjectTrace'
import { testWorkRoot } from '../../tests/support/test-run-env'

const workRoot = testWorkRoot()

describe('ObjectTrace', () => {
	test('serializes a trace of multiple resources', async () => {
		const objectTrace = new ObjectTrace(workRoot, 'Test Label')
		expect(objectTrace.isEmpty).toBe(true)

		objectTrace.addAssertion({
			assertionName: 'Assert',
			message: 'Test Message',
			isFailure: false,
			stack: ['line.1', 'line.2'],
		})

		const err = new Error('This is an Error')
		err.stack = (err.stack || '').split('\n').slice(0, 1).join('\n')
		objectTrace.addError(err)

		expect(objectTrace.isEmpty).toBe(false)

		await objectTrace.addNetworkTrace({
			label: 'Test Label',
			url: 'https://example.com/test',
			op: 'network',
			startTime: 1520880910692,
			endTime: 1520880918563,
			sampleCount: 1,
			errorCount: 1,
			requestHeaders: 'HTTP 1.1 GET /test\n',
		})

		objectTrace.addScreenshot('tmp/data/flood/screenshots/screenshot.png')
		const obj = objectTrace.toObject()
		expect(obj.assertions).toEqual([
			{
				assertionName: 'Assert',
				isFailure: false,
				message: 'Test Message',
				stack: ['line.1', 'line.2'],
			},
		])

		expect(obj.errors).toEqual([
			{
				message: 'This is an Error',
				stack: 'Error: This is an Error',
			},
		])

		expect(obj.label).toEqual('Test Label')
		expect(obj.objectTypes).toEqual(['screenshot', 'trace'])
		expect(obj.objects[0]).toBe('tmp/data/flood/screenshots/screenshot.png')
		expect(obj.objects[1]).toMatch(/network(\/|\\)(\w+)\.json/)
	})
})
