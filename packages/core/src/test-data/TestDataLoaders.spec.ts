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
		let data: TestDataSource<any>
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

	test('can combine 2 JSON/CSV/FromData with the same structure', async () => {
		let data: TestDataSource<any>
		const userKey = 'user'
		//2 JSON
		data = loaders.fromJSON<JSONRow>('users_same.json').as(userKey)
		data = loaders.fromJSON<JSONRow>('users.json').as(userKey)
		await data.load()
		expect(data.size).toBe(9)

		let mustFeed = () => ensureDefined(data.feed())
		for (let i = 1; i <= data.size; i++) {
			expect(mustFeed().username).toBe(`samantha${i}@loadtest.io`)
		}
		data.clear()

		//2 CSV
		data = loaders.fromCSV<JSONRow>('users.csv').as(userKey)
		data = loaders.fromCSV<JSONRow>('users_same.csv').as(userKey)
		await data.load()
		expect(data.size).toBe(6)

		mustFeed = () => ensureDefined(data.feed())
		for (let i = 1; i <= data.size; i++) {
			expect(mustFeed().username).toBe(`samantha${i}@loadtest.io`)
		}
		data.clear()

		//2 Data
		data = loaders.fromData<any>([
			{
				id: 1,
				username: 'test1@gmail.com',
			},
			{
				id: 2,
				username: 'test2@gmail.com',
			},
		])
		data = loaders.fromData<any>([
			{
				id: 1,
				username: 'test3@gmail.com',
			},
			{
				id: 2,
				username: 'test4@gmail.com',
			},
		])
		await data.load()
		expect(data.size).toBe(4)

		mustFeed = () => ensureDefined(data.feed())
		for (let i = 1; i <= data.size; i++) {
			expect(mustFeed().username).toBe(`test${i}@gmail.com`)
		}
		data.clear()
	})

	test('can load data file with pattern', async () => {
		let data: TestDataSource<any>
		//CSV pattern
		data = loaders.fromCSV<JSONRow>('users*.csv')
		await data.load()
		expect(data.size).toBe(6)

		let mustFeed = () => ensureDefined(data.feed())
		expect(mustFeed().username).toBe(`samantha4@loadtest.io`)
		expect(mustFeed().username).toBe(`samantha5@loadtest.io`)
		expect(mustFeed().username).toBe(`samantha6@loadtest.io`)
		expect(mustFeed().username).toBe(`samantha1@loadtest.io`)
		expect(mustFeed().username).toBe(`samantha2@loadtest.io`)
		expect(mustFeed().username).toBe(`samantha3@loadtest.io`)
		data.clear()

		//JSON pattern
		data = loaders.fromJSON<JSONRow>('users*.json')
		await data.load()
		expect(data.size).toBe(9)

		mustFeed = () => ensureDefined(data.feed())
		for (let i = 1; i <= data.size; i++) {
			expect(mustFeed().username).toBe(`samantha${i}@loadtest.io`)
		}
		data.clear()
	})

	test('Should throw an error if load multiple method with the same alias', async () => {
		let data: TestDataSource<any>
		data = loaders.fromCSV<JSONRow>('users.csv').as('user')
		data = loaders.fromJSON<JSONRow>('users.json').as('user')
		await data.load().catch(err => {
			expect(err.message).toEqual(
				'Data files imported using different methods cannot have the same alias',
			)
		})
		data.clear()
	})

	test('Should throw an error if load multiple file with the same method, same alias but different structure', async () => {
		let data: TestDataSource<any>
		data = loaders.fromCSV<JSONRow>('users.csv').as('user')
		data = loaders.fromCSV<JSONRow>('diff_users.csv').as('user')
		await data.load().catch(err => {
			expect(err.message).toEqual(
				'Data files that have different data structures cannot have the same alias',
			)
		})
		data.clear()

		data = loaders.fromJSON<JSONRow>('users.json').as('user')
		data = loaders.fromJSON<JSONRow>('diff_users.json').as('user')
		await data.load().catch(err => {
			expect(err.message).toEqual(
				'Data files that have different data structures cannot have the same alias',
			)
		})
		data.clear()
	})

	test('Should throw an error if load multiple method included `fromData` but does not define alias for this', async () => {
		let data: TestDataSource<any>
		data = loaders.fromCSV<JSONRow>('users.csv').as('userCSV')
		data = loaders.fromJSON<JSONRow>('users.json').as('userJSON')
		data = loaders.fromData<any>([
			{
				id: 1,
				name: 'test1@gmail.com',
			},
		])
		await data.load().catch(err => {
			expect(err.message).toEqual(
				'Alias name of the data imported using fromData() must be specified by using as()',
			)
		})
		data.clear()
	})
})
