import { step, TestSettings, Until, By, Device, Key } from '@flood/element'
import * as assert from 'assert'

export const settings: TestSettings = {
	clearCache: false,
	disableCache: false,
	clearCookies: false,
	loopCount: -1,
	duration: '-1',
	actionDelay: '2s',
	stepDelay: '2s',
	waitTimeout: '60s',
	screenshotOnFailure: true,
	DOMSnapshotOnFailure: true,
}

/**
 * Author: Antonio Jimenez : antonio@flood.io
 * The internet - heroku App
 * @version 1.1
 */

const URL = 'https://the-internet.herokuapp.com'

export default () => {
	step('Test: 01 - Homepage', async (browser) => {
		await browser.visit(URL)
		await browser.wait(Until.elementIsVisible(By.css('#content > h1')))
		const pageTextVerify = By.visibleText('Welcome to the-internet')
		await browser.wait(Until.elementIsVisible(pageTextVerify))
	})

	step('Test: 02 - Infinite Scroll', async (browser) => {
		await browser.visit(URL + '/infinite_scroll')
		const pageTextVerify = By.visibleText('Infinite Scroll')
		await browser.wait(Until.elementIsVisible(pageTextVerify))
	})

	step('Test: 03 - Scrolling down', async (browser) => {
		await browser.press(Key.SPACE)
		await browser.press(Key.PAGE_DOWN)
		await browser.sendKeys(Key.PAGE_DOWN)
		await browser.sendKeys(Key.SPACE)
	})
}
