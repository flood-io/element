import { step, TestSettings, Until, By, Device } from '@flood/element'
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

	step('Test: 02 - Dynamic Loading', async (browser) => {
		await browser.visit(URL + '/dynamic_loading')
		const pageTextVerify = By.visibleText('Dynamically Loaded')
		await browser.wait(Until.elementIsVisible(pageTextVerify))
	})

	step('Test: 03 - Dynamically Loaded Page Elements', async (browser) => {
		const Link = await browser.findElement(By.css('#content > div > a:nth-child(8)'))
		await Link.click()
		const pageTextVerify = By.visibleText('Example 2')
		await browser.wait(Until.elementIsVisible(pageTextVerify))
	})

	step('Test: 04 - Element rendered after the fact', async (browser) => {
		const Add = await browser.findElement(By.css('#start > button'))
		await Add.click()
	})

	step('Test: 05 - Hello World', async (browser) => {
		const pageTextVerify = By.visibleText('Hello World')
		await browser.wait(Until.elementIsVisible(pageTextVerify))
	})
}
