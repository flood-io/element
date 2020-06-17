import { TestSettings, step, afterAll, afterEach, beforeAll, beforeEach } from '@flood/element'

export const settings: TestSettings = {
	loopCount: 1,
}
export default () => {
	beforeAll(() => {
		console.log('before all 0 is running ....')
	}, 300)
	beforeAll(() => {
		console.log('before all 1 is running ....')
	}, 300)

	beforeEach(async () => {
		console.log('before each 0 is running ....')
	}, 300)
	beforeEach(async () => {
		console.log('before each 1 is running ....')
	}, 300)

	step('Step 0', async browser => {
		console.log('Step 0')
	})
	step('Step 1', async browser => {
		console.log('Step 1')
	})

	afterAll(async () => {
		console.log('after all 0 is running ....')
	}, 300)
	afterAll(async () => {
		console.log('after all 1 is running ....')
	}, 300)

	afterEach(async () => {
		console.log('after each 0 is running ....')
	}, 300)
	afterEach(async () => {
		console.log('after each 1 is running ....')
	}, 300)
}
