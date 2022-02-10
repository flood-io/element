import { step, By, TestSettings } from '@flood/element'

export const settings: TestSettings = {
	loopCount: 1,
	screenshotOnFailure: true,
}

export default () => {
	step('1. Start', async (browser) => {
		await browser.visit('https://challenge.flood.io')
		await browser.click(By.css('#foo')) // the selector doesn't exist - will cause error
	})
}
