import { TestSettings, step, afterAll, afterEach, beforeAll, beforeEach, RecoverWith } from '@flood/element'

export const settings: TestSettings = {
	loopCount: 1,
}
export default () => {
	beforeAll(async browser => {
		console.log('The first BeforeAll function is running ....')
		//await browser.visit('https://challenge.flood.io')
	})
	beforeAll(async browser => {
		console.log('The first BeforeAll function is running ....')
		//await browser.visit('https://challenge.flood.io')
	}, 150)

	// beforeAll(async browser => {
	// 	console.log('The second BeforeAll function is running ....')
	// 	//await browser.visit('https://challenge.flood.io')
	// })

	beforeEach(async () => {
		console.log('The first BeforeEach function is running ....')
	})
	beforeEach(async () => {
		console.log('The first BeforeEach function is running ....')
	}, 150)

	// beforeEach(async () => {
	// 	console.log('The second BeforeEach function is running ....')
	// })

	step('Step: first', async browser => {
		console.log('The first step is running ...')
	})

	step('Step: second', async browser => {
		console.log('The second step is running ...')
	})

	step('Step', { waitTimeout: 150 }, async browser => {
		console.log('The second step is running with option ...')
	})

	afterEach(async () => {
		console.log('The AfterEach function is running ....')
	}, 1)
	afterEach(async () => {
		console.log('The AfterEach function is running ....')
	})

	afterAll(async () => {
		console.log('The AfterAll fucntion is running ....')
	})
	afterAll(async () => {
		console.log('The AfterAll fucntion is running ....')
	}, 150)
	step.recovery(async browser => {
		console.log('Recovery step 1 done, retry step 1')
		return RecoverWith.RETRY
	})
}
