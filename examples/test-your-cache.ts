import { TestSettings, step, By } from '@flood/element'

export const settings: TestSettings = {
	loopCount: 1,
}

export default () => {
	step.once({ waitTimeout: 10 }, async browser => {
		await browser.visit('https://refreshyourcache.com/en/cache-test/')
		await browser.takeScreenshot()
		await browser.clearBrowserCache()
		await browser.visit('https://refreshyourcache.com/en/cache-test/')
		await browser.takeScreenshot()
	})
}
