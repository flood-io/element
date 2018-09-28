import { step, TestSettings, Until, By, Device } from '@flood/element'
import * as assert from 'assert'

export const settings: TestSettings = {
	device: Device.iPadLandscape,
	userAgent: 'flood-chrome-test',
	clearCache: true,
	disableCache: true,
}

/**
 * <%= title %>
 * @version 1.0
 */
export default () => {
	step('Test: Start', async browser => {
		await browser.visit('<%= url %>')

		// let buttonLocator = By.css('#my-button')
		// await browser.wait(Until.elementIsVisible(buttonLocator))

		// const button = await browser.findElement(buttonLocator)
		// assert.ok(await button.isDisplayed(), 'Button is visible')
		// await button.click()

		await browser.takeScreenshot()
	})
}
