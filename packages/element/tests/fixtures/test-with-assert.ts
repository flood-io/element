import { step, setup, By, Until, TestSettings } from '@flood/element'
import * as assert from 'assert'

export const settings: TestSettings = {
	screenshotOnFailure: false,
	actionDelay: 0,
	stepDelay: 0,
	waitTimeout: 10,
}

/**
 * Example Test
 *
 * This is an example test
 */
export default function() {
	step('assert', async driver => {
		await driver.visit('http://localhost:1337/wait.html')
		let link = await driver.findElement(By.linkText('show bar'))
		await link.click()
		await driver.wait(Until.elementIsVisible('#foo'))
		assert.equal(await link.text(), 'foobarlink')
	})
}
