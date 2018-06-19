import 'mocha'
import { expect } from 'chai'
import { TestData } from './TestData'

type Row = { user: string; username: string }
type JSONRow = { user: number; username: string }

describe('TestData', () => {
	it('can load CSV data', async () => {
		let data = TestData.fromCSV<Row>('users.csv')
		data.circular().filter(line => line.user === '1')
		await data.load()

		expect(data.feed().user).to.equal('1')
		expect(data.feed().username).to.equal('samantha3@loadtest.io')
	})

	it('can load JSON data', async () => {
		let data = TestData.fromJSON<JSONRow>('users.json')
		data.circular().filter(line => line.user === 1)
		await data.load()
		expect(data.size).to.equal(3)

		expect(data.feed().user).to.equal(1)
		expect(data.feed().username).to.equal('jonny.tester3@loadtest.io')
		expect(data.feed().username).to.equal('jonny.tester5@loadtest.io')
	})
})
