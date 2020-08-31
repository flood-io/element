import { step, setup, By, Until } from '@flood/element'

/**
 * Example Test
 *
 * This is an example test
 */
export default function() {
	setup({
		loopCount: Infinity,
		actionDelay: '0.5s',
		stepDelay: '5s',
	})

	step('Invalid Step', async () => {
		setup({
			loopCount: 10,
		})
	})

	step('Test Step', async driver => {
		await driver.visit('<URL>')
		let link = await driver.findElement(By.linkText('show bar'))
		await link.click()
		await driver.wait(Until.elementIsVisible('#foo'))
	})
}
