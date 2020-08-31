import { step, TestSettings, setup } from '@flood/element'

export const settings: TestSettings = {
	duration: '30s',
	stepDelay: '1s',
	userAgent: 'I AM ROBOT',
}

/**
 * Test Script for evaluating VM features
 *
 * Use this in the test environment.
 */
export default () => {
	setup({
		waitTimeout: '5s',
	})

	// First step
	step('Step 1', { waitTimeout: '60s' }, async driver => {
		await driver.click('#element1')
		await driver.click('#element2')
		await driver.click('#element3')
	})

	step('Step 2', async driver => {
		await driver.click('fail')
		await driver.click('promise-fail')
	})

	step('Step 3', async driver => {
		await driver.click('element')
		await driver.click('wait')
	})
}
