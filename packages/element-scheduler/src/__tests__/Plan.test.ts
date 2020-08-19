import { Plan } from '../Plan'
import parseDuration from 'parse-duration'

describe('Plan', () => {
	let plan: Plan
	beforeAll(() => {
		plan = new Plan([
			{ duration: '5s', target: 5 },
			{ duration: '1m', target: 5 },
			{ duration: '5s', target: 0 },
		])
	})

	test('can get max users', () => {
		expect(plan.maxUsers).toEqual(5)
	})

	test('can get max duration', () => {
		expect(plan.maxDuration).toEqual(parseDuration('1m 10s'))
	})

	test('it can forecast each ramp change', () => {
		expect(plan.make()).toEqual([
			[1000, 1, 1],
			[2000, 1, 2],
			[3000, 1, 3],
			[4000, 1, 4],
			[5000, 1, 5],
			[65000, 0, 5],
			[66000, -1, 4],
			[67000, -1, 3],
			[68000, -1, 2],
			[69000, -1, 1],
			[70000, -1, 0],
		])
	})
	test('it run ticker for each step', async () => {
		plan = new Plan([{ duration: '500ms', target: 10 }])

		const handler = jest.fn()
		await plan.ticker(async (ts, target, total) => {
			handler([ts, target, total])
		})

		expect(handler).toHaveBeenCalledTimes(10)
		expect(handler).toHaveBeenNthCalledWith(1, [50, 1, 1])
		expect(handler).toHaveBeenLastCalledWith([500, 1, 10])
	})
})
