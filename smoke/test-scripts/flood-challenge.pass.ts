import { step, By, Until, TestSettings } from '@flood/element'
import * as assert from 'assert'

export const settings: TestSettings = {
	// loopCount: 1,
	clearCache: false,
	clearCookies: true,
	responseTimeMeasurement: 'step',
	userAgent: 'I AM ROBOT',
	actionDelay: '1s',
	stepDelay: '1s',
	name: 'Flood challenge',
	description: 'Flood challenge yeahh',
}

export default async () => {
	step('1. Start', async browser => {
		await browser.visit('https://challenge.flood.io')

		await browser.takeScreenshot()
	})

	step('2. Age', async browser => {
		let button = By.css('#new_challenger > input.btn.btn-xl.btn-default')
		await browser.wait(Until.elementIsVisible(button))
		await browser.click(button)

		let select = By.id('challenger_age')
		await browser.wait(Until.elementIsVisible(select))
		await browser.selectByValue(select, '42')

		await browser.takeScreenshot()
	})

	step('3. Largest Order', async browser => {
		await browser.click('input.btn')

		let table = By.css('table tbody tr td:first-of-type label')
		await browser.wait(Until.elementIsVisible(table))

		let orderElements = await browser.findElements(table)
		assert(orderElements.length > 0, 'expected to find orders on this page')

		let orderIDs = await Promise.all(orderElements.map(element => element.text()))

		// Find largest number by sorting and picking the first item
		let largestOrder = orderIDs
			.map(Number)
			.sort((a, b) => a - b)
			.reverse()[0]

		// Click label with order ID
		await browser.click(By.visibleText(String(largestOrder)))

		// Fill in text field
		let field = By.id('challenger_largest_order')
		await browser.type(field, String(largestOrder))

		await browser.takeScreenshot()
	})

	step('4. Easy', async browser => {
		await browser.click('input.btn')

		await browser.takeScreenshot()
	})

	step('5. One Time Token', async browser => {
		await browser.click('input.btn')

		await browser.wait(Until.elementTextMatches('span.token', /\d+/))
		let element = await browser.findElement('span.token')
		let token = await element.text()
		await browser.type(By.id('challenger_one_time_token'), token)

		await browser.takeScreenshot()
	})

	step('6. Done', async browser => {
		await browser.click('input.btn')

		await browser.wait(Until.elementIsVisible('h2'))
		let element = await browser.findElement('h2')
		let completionText = await element.text()
		assert.equal(completionText, "You're Done!")

		await browser.takeScreenshot()
	})
}
