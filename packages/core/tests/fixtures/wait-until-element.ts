import { step, setup, By, Until } from '@flood/element'

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

	step('By.linkText', async driver => {
		await driver.visit('http://localhost:1337/wait.html')
		await driver.findElement(By.linkText('show bar'))
	})

	step('By.linkText many', async driver => {
		await driver.visit('http://localhost:1337/wait.html')
		await driver.findElements(By.linkText('show bar'))
	})

	step('By.partialLinkText', async driver => {
		await driver.visit('http://localhost:1337/wait.html')
		await driver.findElement(By.partialLinkText('show'))
	})

	step('By.css', async driver => {
		await driver.visit('http://localhost:1337/wait.html')
		await driver.findElement(By.css('body a[href]'))
	})

	step('elementIsVisible', async driver => {
		await driver.visit('http://localhost:1337/wait.html')
		let link = await driver.findElement(By.linkText('show bar'))
		await link.click()
		await driver.wait(Until.elementIsVisible('#foo'))
	})
}
