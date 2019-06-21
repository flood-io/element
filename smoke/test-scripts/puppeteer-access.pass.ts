import { step, TestSettings, Until, By, MouseButtons, Device, Browser } from '@flood/element'
import * as assert from 'assert'

export const settings: TestSettings = {
	loopCount: 1,
	device: Device.iPadLandscape,
	userAgent: 'I AM ROBOT',
	disableCache: true,
	actionDelay: 1,
	stepDelay: 2,
	responseTimeMeasurement: 'step',
}

/**
 * Flood Challenge
 * Version: 1.0
 */
export default () => {
	step('Flood Challenge: Start', async (browser: Browser) => {
		await browser.visit('https://challenge.flood.io')

		const page = browser.page

		const content = await page.content()

		assert.ok(content.includes('Welcome to our Script Challenge'))
	})
}
