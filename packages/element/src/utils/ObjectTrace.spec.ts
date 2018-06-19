import { expect } from 'chai'
import 'mocha'
import { ObjectTrace } from './ObjectTrace'

describe('ObjectTrace', () => {
	it('serializes a trace of multiple resources', async () => {
		let objectTrace = new ObjectTrace('Test Label')
		expect(objectTrace.isEmpty).to.be.true

		objectTrace.addAssertion({
			assertionName: 'Assert',
			message: 'Test Message',
			isFailure: false,
			stack: ['line.1', 'line.2'],
		})

		let err = new Error('This is an Error')
		err.stack = err.stack
			.split('\n')
			.slice(0, 1)
			.join('\n')
		objectTrace.addError(err)

		expect(objectTrace.isEmpty).to.be.false

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
		let obj = objectTrace.toObject()
		expect(obj.assertions).to.deep.equal([
			{
				assertionName: 'Assert',
				isFailure: false,
				message: 'Test Message',
				stack: ['line.1', 'line.2'],
			},
		])

		expect(obj.errors).to.deep.equal([
			{
				message: 'This is an Error',
				stack: 'Error: This is an Error',
			},
		])

		expect(obj.label).to.deep.equal('Test Label')
		expect(obj.objectTypes).to.deep.equal(['screenshot', 'trace'])
		expect(obj.objects[0]).to.equal('tmp/data/flood/screenshots/screenshot.png')
		expect(obj.objects[1]).to.match(/tmp\/data\/flood\/network\/(.+)\.json/)
	})
})
