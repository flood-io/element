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

	step('Test: 02 - Frames', async (browser) => {
		await browser.visit(URL + '/frames')
		const pageTextVerify = By.visibleText('Frames')
		await browser.wait(Until.elementIsVisible(pageTextVerify))
	})

	step('Test: 03 - iFrames', async (browser) => {
		await browser.visit(URL + '/iframe')
		const pageTextVerify = By.visibleText('iFrame')
		await browser.wait(Until.elementIsVisible(pageTextVerify))
	})

	step('Test: 04 - Enter Text', async (browser) => {
		const iframe = await browser.findElement(By.tagName('iframe'))
		await browser.switchTo().frame(iframe)
		const Box = await browser.findElement(By.tagName('body'))
		await Box.click()
		await Box.sendKeys('   !Flood Element rules!')
	})
}
