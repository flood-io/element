import { TestSettings, step, afterAll, afterEach, beforeAll, beforeEach } from '@flood/element'

export const settings: TestSettings = {
	loopCount: 1,
	waitTimeout: 30,
}
export default () => {
	beforeAll(async browser => {
		//await browser.visit('https://challenge.flood.io')
		console.log('before all is running ....')
	}, 1)

	beforeEach(async () => {
		console.log('before each is running ....')
	}, 1)

	step('Step 0', async browser => {
		console.log('Step 0')
	})
	step('Step 1', async browser => {
		console.log('Step 1')
	})

	afterEach(async () => {
		console.log('after each is running ....')
	}, 1)

	afterAll(async () => {
		console.log('after all is running ....')
	})
}
