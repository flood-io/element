import { Plan } from '../Plan'
import parseDuration from 'parse-duration'

describe('Plan', () => {
	let plan: Plan
	beforeAll(() => {
		plan = new Plan([
			{ duration: '5s', target: 5 },
			{ duration: '1m', target: 5 },
			{ duration: '5s', target: 1 },
		])
	})

	test('can get max users', () => {
		expect(plan.maxUsers).toEqual(5)
	})

	test('can get max duration', () => {
		expect(plan.maxDuration).toEqual(parseDuration('1m 10s'))
	})

	test('it run ticker for each step', async () => {
		plan = new Plan([
			{ duration: '500ms', target: 2 },
			{ duration: '600ms', target: 3 },
		])

		const handler = jest.fn()
		await plan.ticker(
			async (ts, target, total) => {
				handler([ts, target, total])
			},
			async () => {},
			async () => {}
		)

		expect(handler).toHaveBeenCalledTimes(2)
		expect(handler).toHaveBeenNthCalledWith(1, [500, 2, 0])
		expect(handler).toHaveBeenNthCalledWith(2, [600, 3, 1])
	})
})
