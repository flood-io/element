import { step, setup, By, Until, TestSettings } from '@flood/element'
import assert from 'assert'

export const settings: TestSettings = {
	actionDelay: 0.1,
	stepDelay: 0.1,
	waitTimeout: 10,
}

/**
 * Example Test
 *
 * This is an example test
 */
export default function() {
	step('console.assert', async driver => {
		await driver.visit('<URL>')
		let link = await driver.findElement(By.linkText('show bar'))
		await link.click()
		await driver.wait(Until.elementIsVisible('#foo'))
		console.assert((await link.text()) === 'foobarlink', 'Expected link text to be foobarlink')

		assert((await link.text()) === 'foobarlink')
	})
}
