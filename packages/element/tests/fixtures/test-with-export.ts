import { step, setup, By, Until } from '@flood/chrome'

/**
 * Example Test
 *
 * This is an example test
 */
export default function() {
	setup({
		loopCount: Infinity,
		actionDelay: 0,
		stepDelay: 0,
	})

	step('Invalid Step', async () => {
		setup({
			loopCount: 10,
		})
	})

	step('Test Step', async driver => {
		await driver.visit('http://localhost:1337/wait.html')
		let link = await driver.findElement(By.linkText('show bar'))
		await link.click()
		await driver.wait(Until.elementIsVisible('#foo'))
	})
}
