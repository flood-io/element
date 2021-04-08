import { step, TestSettings, Until, By, MouseButtons, Device, Browser } from '@flood/element'

export const settings: TestSettings = {
	loopCount: 1,
	device: Device.iPadLandscape,
	userAgent: 'I AM ROBOT',
	disableCache: true,
	actionDelay: '1s',
	stepDelay: '2s',
	responseTimeMeasurement: 'step',
}

/**
 * Flood Challenge
 * Version: 1.0
 */
export default () => {
	step('Flood Challenge: Start', async (browser: Browser) => {
		await browser.visit('https://challenge.flood.io')

		const locator = By.css('#doesnt-exist')
		await browser.wait(Until.elementIsVisible(locator))

		const element = await browser.findElement(locator)
		await element.click({ button: MouseButtons.LEFT })
	})
}
