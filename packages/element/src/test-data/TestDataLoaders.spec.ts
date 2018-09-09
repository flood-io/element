import 'mocha'
import { expect } from 'chai'
import { TestDataLoaders } from './TestDataLoaders'
import { testWorkRoot } from '../../tests/support/test-run-env'

function ensureDefined<T>(value: T | undefined | null): T | never {
	if (value === undefined || value === null) {
		throw new Error('value was not defined')
	} else {
		return value
	}
}

const workRoot = testWorkRoot()
const loaders = new TestDataLoaders(workRoot)

type Row = { user: string; username: string }
type JSONRow = { user: number; username: string }

describe('TestDataLoaders', () => {
	it('can load CSV data', async () => {
		let data = loaders.fromCSV<Row>('users.csv')
		data.circular().filter(line => line.user === '1')
		await data.load()

		const mustFeed = () => ensureDefined(data.feed())

		expect(mustFeed().user).to.equal('1')
		expect(mustFeed().username).to.equal('samantha3@loadtest.io')
	})

	it('can load JSON data', async () => {
		let data = loaders.fromJSON<JSONRow>('users.json')

		data.circular().filter(line => line.user === 1)
		await data.load()
		expect(data.size).to.equal(3)

		const mustFeed = () => ensureDefined(data.feed())

		expect(mustFeed().user).to.equal(1)
		expect(mustFeed().username).to.equal('jonny.tester3@loadtest.io')
		expect(mustFeed().username).to.equal('jonny.tester5@loadtest.io')
	})
})
