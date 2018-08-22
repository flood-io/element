import { step, TestSettings, Until, By, MouseButtons, Device, Browser } from '@flood/element'
import * as assert from 'assert'
export const settings: TestSettings = {
	device: Device.iPadLandscape,
	userAgent: 'flood-chrome-test',
	clearCache: true,
	disableCache: true,
}

/**
 * <%= title %>
 * Version: 1.0
 */
export default () => {
	step('Test: Start', async (browser: Browser) => {
		await browser.visit('<%= url %>')

		assert(true, 'congratulations!')
	})
}
