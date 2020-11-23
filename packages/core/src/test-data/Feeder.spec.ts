import { Feeder } from './Feeder'
import { FileType } from './Loader'

function ensureDefined<T>(value: T | undefined | null): T | never {
	if (value === undefined || value === null) {
		throw new Error('value was not defined')
	} else {
		return value
	}
}

const lines = [
	{ user: '1', username: 'johnny1@loadtest.io', password: 'correcthorsebatterstaple!' },
	{ user: '2', username: 'johnny2@loadtest.io', password: 'correcthorsebatterstaple!' },
	{ user: '3', username: 'johnny3@loadtest.io', password: 'correcthorsebatterstaple!' },
	{ user: '4', username: 'johnny4@loadtest.io', password: 'correcthorsebatterstaple!' },
	{ user: '5', username: 'johnny5@loadtest.io', password: 'correcthorsebatterstaple!' },
	{ user: '1', username: 'johnny6@loadtest.io', password: 'correcthorsebatterstaple!' },
]

type Row = { user: string; username: string; password: string }

describe('Feeder', () => {
	test('Process line by line with filter', async () => {
		const feeder = new Feeder<Row>('1')
		feeder
			.circular(false)
			.filter((line, index, instanceID) => line.user === instanceID)
			.filter(line => !!line.username)
			.filter(Boolean)
			.append(lines, '', FileType.CSV)

		expect(feeder.feed()).toEqual({
			user: '1',
			username: 'johnny1@loadtest.io',
			password: 'correcthorsebatterstaple!',
		})
		expect(feeder.isComplete).toBe(false)
		expect(feeder.feed()).toEqual({
			user: '1',
			username: 'johnny6@loadtest.io',
			password: 'correcthorsebatterstaple!',
		})
		expect(feeder.feed()).toEqual(null)
		expect(feeder.isComplete).toBe(true)
		expect(feeder.size).toBe(2)
	})

	test('can be reset', async () => {
		const feeder = new Feeder<Row>('1')
			.filter((line, index, instanceID) => line.user === instanceID)
			.append(lines, '', FileType.CSV)
			.circular(false)

		expect(feeder.isStart).toBe(true)
		expect(feeder.feed()).not.toBeNull()
		expect(feeder.feed()).not.toBeNull()
		expect(feeder.size).toBe(2)

		expect(feeder.isComplete).toBe(true)
		feeder.reset()
		expect(feeder.isComplete).toBe(false)
	})

	test('is be looped by default', async () => {
		const feeder = new Feeder<Row>('1')
			.filter((line, index, instanceID) => line.user === instanceID)
			.append(lines, '', FileType.CSV)

		expect(feeder.size).toBe(2)

		const mustFeed = () => ensureDefined(feeder.feed())

		expect(mustFeed()['username']).toBe('johnny1@loadtest.io')
		expect(mustFeed()['username']).toBe('johnny6@loadtest.io')
		expect(mustFeed()['username']).toBe('johnny1@loadtest.io')
		expect(mustFeed()['username']).toBe('johnny6@loadtest.io')
	})

	test('can be randomized', async () => {
		const feeder = new Feeder<Row>('1').shuffle().append(lines, '', FileType.CSV)
		const mustFeed = () => ensureDefined(feeder.feed())
		const users = [mustFeed()['username'], mustFeed()['username'], mustFeed()['username']]

		expect(users).not.toEqual(['johnny1@loadtest.io', 'johnny2@loadtest.io', 'johnny3@loadtest.io'])
	})
})
