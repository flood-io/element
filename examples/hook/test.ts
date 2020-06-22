import {
	TestSettings,
	step,
	afterAll,
	afterEach,
	beforeAll,
	beforeEach,
	By,
	Until,
} from '@flood/element'

export const settings: TestSettings = {
	loopCount: 2,
}
export default () => {
	beforeAll(async browser => {
		console.log('before all is running ....')
		await browser.visit('https://challenge.flood.io')
	})

	beforeEach(async () => {
		console.log('before each is running ....')
	})

	step('Step 0', async browser => {
		console.log('step 0 is running ...')
	})

	step('Step 1', async browser => {
		console.log('step 1 is running ...')
	})

	afterEach(async () => {
		console.log('after each is running ....')
	}, 1)

	afterAll(async () => {
		console.log('after all is running ....')
	})
}
