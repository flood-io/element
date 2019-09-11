import { step, By, TestSettings } from '@flood/element'

export const settings: TestSettings = {
	// loopCount: 1,
	userAgent: 'I AM ROBOT',

	// Auto wait until elements are visible before acting
	waitUntil: 'visible',
}

/**
 * A helper to get the largest order number for Step 2
 */
const largestNumber = (numbers: (number | string)[]): number =>
	numbers
		.map(Number)
		.sort((a, b) => a - b)
		.reverse()[0]

export default () => {
	step('Open page and click start', async b => {
		await b.visit('https://challenge.flood.io')
		await b.click(By.css('#new_challenger > input.btn.btn-xl.btn-default'))
		await b.takeScreenshot()
	})

	step('Challenge: Step 1', async b => {
		await b.selectByValue(By.id('challenger_age'), '31')
		await b.takeScreenshot()
		await b.click('input.btn')
	})

	step('Challenge: Step 2', async b => {
		let orderElements = await b.findElements(By.css('table tbody tr td:first-of-type label'))
		let orderIDs = await Promise.all<string>(orderElements.map(element => element.text()))
		let largestOrder = largestNumber(orderIDs)
		// Fill in text field
		await b.type(By.id('challenger_largest_order'), String(largestOrder))
		// Click label with order ID
		await b.click(By.visibleText(String(largestOrder)))
		await b.takeScreenshot()
		await b.click(By.css('input.btn'))
	})

	step('Challenge: Step 3', async b => {
		await b.click('input.btn')
		await b.takeScreenshot()
	})

	step('Challenge: Step 4', async b => {
		let element = await b.findElement('span.token')
		let token = await element.text()
		await b.type(By.id('challenger_one_time_token'), token)
		await b.takeScreenshot()
		await b.click('input.btn')
	})

	step('Challenge: Step 5', async b => {
		let element = await b.findElement('h2')
		await b.takeScreenshot()
		let completionText = await element.text()
		if (completionText.trim() !== "You're Done!")
			throw new Error(`Expected header to be "You're Done!", got "${completionText}"`)
	})
}
