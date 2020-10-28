import { step, Until, By, TestSettings } from '@flood/element'
import assert from 'assert'

/**
 * Author: Hong La : hong@flood.io
 * Mozilla Demos
 */

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

const URL =
	'https://mdn.mozillademos.org/en-US/docs/Web/API/Element/dblclick_event$samples/Examples'

export default () => {
	step('Test: Double Click Event', async browser => {
		await browser.visit(URL)
		const pageTextVerify = By.visibleText('My Card')
		await browser.wait(Until.elementIsVisible(pageTextVerify))
		const asideEl = await browser.findElement(By.tagName('aside'))
		await browser.doubleClick(asideEl)
		const asideLargeClass = await asideEl.getAttribute('class')
		assert(
			asideLargeClass.toLowerCase() === 'large',
			'The aside element should have large class after be dblclicked',
		)
		await browser.wait(3)
		await browser.takeScreenshot()
	})
}
