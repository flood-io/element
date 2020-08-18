import { TestSettings, step, By } from '@flood/element'
import assert from 'assert'

export const settings: TestSettings = {
	loopCount: 1,
}

export default () => {
	step(async browser => {
		await browser.visit('https://refreshyourcache.com/en/cache-test/')
		await browser.takeScreenshot()
		await browser.clearBrowserCache()
		await browser.visit('https://refreshyourcache.com/en/cache-test/')
		await browser.takeScreenshot()
	})
}
