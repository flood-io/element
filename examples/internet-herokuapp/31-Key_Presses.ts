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

	step('Test: 02 - Key Presses', async (browser) => {
		await browser.visit(URL + '/key_presses')
		const pageTextVerify = By.visibleText('Key Presses')
		await browser.wait(Until.elementIsVisible(pageTextVerify))
	})

	step('Test: 03 - Keys', async (browser) => {
		await browser.press(Key.SPACE)
		await browser.press(Key.PAGE_DOWN)
		await browser.sendKeys(Key.PAGE_UP)
		await browser.sendKeys(Key.ENTER)
		await browser.press(Key.TAB)
		await browser.press(Key.UP)
		await browser.sendKeys(Key.DOWN)
		await browser.sendKeys(Key.LEFT)
		await browser.sendKeys(Key.RIGHT)
		await browser.sendKeys(Key.ESCAPE)
	})
}
