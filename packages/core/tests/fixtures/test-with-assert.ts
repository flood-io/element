import { step, setup, By, Until, TestSettings } from '@flood/element'
import * as assert from 'assert'

export const settings: TestSettings = {
	screenshotOnFailure: false,
	actionDelay: '0s',
	stepDelay: '0s',
	waitTimeout: '10s',
}

/**
 * Example Test
 *
 * This is an example test
 */
export default function () {
	step('assert', async (driver) => {
		await driver.visit('<URL>')
		const link = await driver.findElement(By.linkText('show bar'))
		await link.click()
		await driver.wait(Until.elementIsVisible('#foo'))
		assert.equal(await link.text(), 'foobarlink')
	})
}
