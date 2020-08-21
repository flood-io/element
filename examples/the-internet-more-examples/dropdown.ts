import { step, Until, By, TestSettings, beforeAll } from '@flood/element'
import assert from 'assert'

export const settings: TestSettings = {
	clearCache: false,
	disableCache: false,
	clearCookies: false,
	loopCount: 1,
	duration: 1,
	actionDelay: 2,
	stepDelay: 2,
	waitTimeout: 60,
	screenshotOnFailure: true,
}

const URL = 'https://the-internet.herokuapp.com'

export default () => {
	beforeAll(async browser => {
		await browser.visit(`${URL}/dropdown`)

		const pageTextVerified = By.css('#content h3')
		await browser.wait(Until.elementIsVisible(pageTextVerified))
	})

	step('Set browser viewport and select an option within a <select> tag', async browser => {
		// Set viewport for browser
		await browser.setViewport({ width: 1366, height: 768 })
		const dropdown = await browser.findElement(By.id('dropdown'))

		// Select the option 1 by text
		await browser.selectByText(dropdown, 'Option 1')
		const dropdownValue = await dropdown.getProperty('value')
		assert.strictEqual(parseInt(dropdownValue), 1, 'The value of the dropdown should be correct')

		// Take the screenshot
		await browser.takeScreenshot({ path: 'selectOption1.png', fullPage: true })
	})
}
