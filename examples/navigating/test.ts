import { step } from '@flood/element'

export default () => {
	step('Test: Start', async (browser) => {
		await browser.visit('https://challenge.flood.io/')
		await browser.takeScreenshot()
	})
}
