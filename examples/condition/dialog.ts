import { Browser, step, Until, TestSettings } from '@flood/element'

export const settings: TestSettings = {
	loopCount: 1,
}

export default () => {
	step('Load Example', async (browser: Browser) => {
		try {
			const condition = Until.alertIsPresent()
			await browser.visit('http://127.0.0.1:8080/onload.html', {
				waitUntil: 'domcontentloaded',
			})
			const alert = await condition.waitForEvent(browser.page)
			if (alert) {
				console.log('dialog appear')
			}
		} catch (err) {
			console.log(`Error: ${err}`)
		}
	})
}
