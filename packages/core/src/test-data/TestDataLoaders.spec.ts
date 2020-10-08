import { TestDataLoaders } from './TestDataLoaders'
import { testWorkRoot } from '../../tests/support/test-run-env'
import { TestDataSource } from './TestData'

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
	test('can load CSV data', async () => {
		const data = loaders.fromCSV<Row>('users.csv')
		data.circular().filter(line => line.user === '1')
		await data.load()
		expect(data.size).toBe(2)

		const mustFeed = () => ensureDefined(data.feed())

		expect(mustFeed().user).toBe('1')
		expect(mustFeed().username).toBe('samantha3@loadtest.io')
		data.clear()
	})

	test('can load JSON data', async () => {
		const data = loaders.fromJSON<JSONRow>('users.json')

		data.circular().filter(line => line.user === 1)
		await data.load()
		expect(data.size).toBe(3)

		const mustFeed = () => ensureDefined(data.feed())

		expect(mustFeed().user).toBe(1)
		expect(mustFeed().username).toBe('samantha6@loadtest.io')
		expect(mustFeed().username).toBe('samantha8@loadtest.io')
		data.clear()
	})

	test('can load multiple csv and json file', async () => {
		let data: TestDataSource<any> = null
		const userCSV = 'user'
		const orderCSV = 'order'
		const userJSON = 'userJSON'
		const userData = 'userData'
		data = loaders.fromCSV<JSONRow>('users.csv').as(userCSV)
		data = loaders.fromJSON<JSONRow>('users.json').as(userJSON)
		data = loaders.fromCSV<JSONRow>('orders.csv').as(orderCSV)
		data = loaders
			.fromData([
				{
					id: '1',
					username: 'johny1@loadtest.io',
				},
				{
					id: '2',
					username: 'johny2@loadtest.io',
				},
			])
			.as(userData)
		await data.load()
		expect(data.size).toBe(13)

		const mustFeed = () => ensureDefined(data.feed())

		let iterationData = mustFeed()
		expect(iterationData[userCSV].username).toBe('samantha1@loadtest.io')
		expect(iterationData[orderCSV].username).toBe('ivan1@loadtest.io')
		expect(iterationData[userJSON].username).toBe('samantha4@loadtest.io')
		expect(iterationData[userData].username).toBe('johny1@loadtest.io')

		iterationData = mustFeed()
		expect(iterationData[userCSV].username).toBe('samantha2@loadtest.io')
		expect(iterationData[orderCSV].username).toBe('ivan2@loadtest.io')
		expect(iterationData[userJSON].username).toBe('samantha5@loadtest.io')
		expect(iterationData[userData].username).toBe('johny2@loadtest.io')

		iterationData = mustFeed()
		expect(iterationData[userCSV].username).toBe('samantha3@loadtest.io')
		expect(iterationData[orderCSV].username).toBe('ivan1@loadtest.io')
		expect(iterationData[userJSON].username).toBe('samantha6@loadtest.io')
		expect(iterationData[userData].username).toBe('johny1@loadtest.io')
		data.clear()
	})

	test('can combine csv and json if the same name', async () => {
		let data: TestDataSource<any> = null
		const userKey = 'user'
		data = loaders.fromCSV<JSONRow>('users.csv').as(userKey)
		data = loaders.fromJSON<JSONRow>('users.json').as(userKey)
		await data.load()
		expect(data.size).toBe(9)

		const mustFeed = () => ensureDefined(data.feed())
		for (let i = 1; i <= data.size; i++) {
			expect(mustFeed().username).toBe(`samantha${i}@loadtest.io`)
		}
	})
})
