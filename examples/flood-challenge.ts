import { step, TestSettings, Until, By, Browser } from '@flood/element'
import assert from 'assert'
export const settings: TestSettings = {
	loopCount: 1,
	userAgent: 'I AM ROBOT',
	disableCache: true,
	actionDelay: '1s',
	stepDelay: '2s',
	responseTimeMeasurement: 'step',
	incognito: true,
}

/**
 * Flood Challenge
 * Version: 1.0
 */
export default () => {
	step('Flood Challenge: Start', async (browser: Browser) => {
		await browser.visit('https://challenge.flood.io', {
			waitUntil: 'load',
		})

		await browser.wait(0.5)

		const locator = By.css('#new_challenger > input.btn.btn-xl.btn-default')
		await browser.wait(Until.elementIsVisible(locator))

		const element = await browser.findElement(locator)
		await element.click()
	})

	step('Flood Challenge: Step 1', async (browser: Browser) => {
		// await browser['waitForNavigationComplete']()
		await browser.wait(Until.elementIsVisible(By.id('challenger_age')))

		await browser.selectByValue(By.id('challenger_age'), '28')
		const select = await browser.findElement(By.id('challenger_age'))
		await select.takeScreenshot()

		await browser.click(By.css('input.btn'), { button: 'left', clickCount: 1, delay: 0.5 })
	})

	step('Flood Challenge: Step 2', async (browser: Browser) => {
		await browser.wait(Until.elementIsVisible('table tbody tr td:first-of-type label'))
		const orderElements = await browser.findElements(
			By.css('table tbody tr td:first-of-type label')
		)

		assert(orderElements.length > 0, 'expected to find orders on this page')

		const orderIDs = await Promise.all(orderElements.map((element) => element.text()))

		// Find largest number by sorting and picking the first item
		const largestOrder = orderIDs
			.map(Number)
			.sort((a, b) => a - b)
			.reverse()[0]

		// Fill in text field
		await browser.type(By.id('challenger_largest_order'), String(largestOrder), { delay: 0.5 })

		// Click label with order ID
		await browser.click(By.visibleText(String(largestOrder)))

		await browser.click(By.css('input.btn'))
	})

	step('Flood Challenge: Step 3', async (browser: Browser) => {
		await browser.wait(Until.elementIsVisible('input.btn'))
		await browser.click('input.btn')
	})

	step('Flood Challenge: Step 4', async (browser: Browser) => {
		await browser.wait(Until.elementTextMatches('span.token', /\d+/))
		const element = await browser.findElement('span.token')
		const token = await element.text()
		await browser.type(By.id('challenger_one_time_token'), token)

		await browser.takeScreenshot()
		await browser.click('input.btn')
	})

	step('Flood Challenge: Step 5', async (browser: Browser) => {
		await browser.wait(Until.elementIsVisible('h2'))
		const element = await browser.findElement('h2')
		const completionText = await element.text()
		assert.strictEqual(completionText, "You're Done!")
	})
}
