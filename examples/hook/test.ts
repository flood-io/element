import {
	TestSettings,
	step,
	afterAll,
	afterEach,
	beforeAll,
	beforeEach,
	By,
	Until,
	Driver,
} from '@flood/element'
import assert from 'assert'

export const settings: TestSettings = {
	loopCount: 1,
	waitTimeout: 10,
}
export default () => {
	beforeAll(async browser => {
		await browser.visit('https://challenge.flood.io')
		console.log('before all is running ....')
	}, 15)

	beforeEach(async () => {
		console.log('before each is running ....')
	}, 1)

	step('Step 0', async browser => {
		let locator = By.css('#new_challenger > input.btn.btn-xl.btn-default')
		await browser.wait(Until.elementIsVisible(locator))

		let element = await browser.findElement(locator)
		await element.click()
	})
	step('Step 1', async browser => {
		// await browser['waitForNavigationComplete']()
		await browser.wait(Until.elementIsVisible(By.id('challenger_age')))

		await browser.selectByValue(By.id('challenger_age'), '28')
		let select = await browser.findElement(By.id('challenger_age'))
		await select.takeScreenshot()

		await browser.click(By.css('input.btn'))
	})
	step('Flood Challenge: Step 2', async (browser: Driver) => {
		await browser.wait(Until.elementIsVisible('table tbody tr td:first-of-type label'))
		let orderElements = await browser.findElements(By.css('table tbody tr td:first-of-type label'))

		assert(orderElements.length > 0, 'expected to find orders on this page')

		let orderIDs = await Promise.all(orderElements.map(element => element.text()))

		// Find largest number by sorting and picking the first item
		let largestOrder = orderIDs
			.map(Number)
			.sort((a, b) => a - b)
			.reverse()[0]

		// Fill in text field
		await browser.type(By.id('challenger_largest_order'), String(largestOrder))

		// Click label with order ID
		await browser.click(By.visibleText(String(largestOrder)))

		await browser.click(By.css('input.btn'))
	})

	step('Flood Challenge: Step 3', async (browser: Driver) => {
		await browser.wait(Until.elementIsVisible('input.btn'))
		await browser.click('input.btn')
	})

	step('Flood Challenge: Step 4', async (browser: Driver) => {
		await browser.wait(Until.elementTextMatches('span.token', /\d+/))
		let element = await browser.findElement('span.token')
		let token = await element.text()
		await browser.type(By.id('challenger_one_time_token'), token)

		await browser.takeScreenshot()
		await browser.click('input.btn')
	})

	step('Flood Challenge: Step 5', async (browser: Driver) => {
		await browser.wait(Until.elementIsVisible('h2'))
		let element = await browser.findElement('h2')
		let completionText = await element.text()
		assert.equal(completionText, "You're Done!")
	})

	afterEach(async () => {
		console.log('after each is running ....')
	}, 1)

	afterAll(async () => {
		console.log('after all is running ....')
	})
}
