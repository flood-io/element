import { step, setup, By, Until, TestSettings } from '@flood/element'
import assert from 'assert'

export const settings: TestSettings = {
	actionDelay: '0.1s',
	stepDelay: '0.1s',
	waitTimeout: '10s',
}

/**
 * Example Test
 *
 * This is an example test
 */
export default function () {
	step('console.assert', async (driver) => {
		await driver.visit('<URL>')
		const link = await driver.findElement(By.linkText('show bar'))
		await link.click()
		await driver.wait(Until.elementIsVisible('#foo'))
		console.assert((await link.text()) === 'foobarlink', 'Expected link text to be foobarlink')

		assert((await link.text()) === 'foobarlink')
	})
}
