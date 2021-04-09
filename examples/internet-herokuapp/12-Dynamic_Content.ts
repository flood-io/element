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

	step('Test: 02 - Dynamic Content', async (browser) => {
		await browser.visit(URL + '/dynamic_content')
		await browser.wait(Until.elementIsVisible(By.css('#content > div > h3')))
		const pageTextVerify = By.visibleText('Dynamic Content')
		await browser.wait(Until.elementIsVisible(pageTextVerify))
	})

	step('Test: 03 - Dynamic Content - Dynamic Parameter', async (browser) => {
		const linkDyn = await browser.findElement(By.css('#content > div > p:nth-child(3) > a'))
		await linkDyn.click()
		await browser.wait(Until.elementIsVisible(By.css('#content > div > h3')))
	})
}
