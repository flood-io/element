import { step, TestSettings, Until, By } from '@flood/element'
const assert = require('assert')

export const settings: TestSettings = {
	clearCache: false,
	disableCache: false,
	clearCookies: false,
	loopCount: -1,
	duration: -1,
	actionDelay: 2,
	stepDelay: 2,
	waitTimeout: 60,
	screenshotOnFailure: true,
}

/**
 * Author: Antonio Jimenez : antonio@flood.io
 * The internet - heroku App
 * @version 1.1
 */

const URL = 'https://the-internet.herokuapp.com'

export default () => {
	step('Test: 01 - Homepage', async browser => {
		await browser.visit(URL)
		await browser.wait(Until.elementIsVisible(By.css('#content > h1')))
		let pageTextVerify = By.visibleText('Welcome to the-internet')
		await browser.wait(Until.elementIsVisible(pageTextVerify))
	})

	step('Test: 02 - Nested Frames', async browser => {
		await browser.visit(URL + '/nested_frames')
	})

	step('Test: 03 - Frames', async browser => {
		let ArrayFrames = await browser.findElements(By.tagName('frame'))
		assert(ArrayFrames.length > 0, 'expected to find some Frames')
		await browser.switchTo().frame('frame-top')
		await browser.switchTo().defaultContent()
		await browser.switchTo().frame('frame-left')
		await browser.switchTo().defaultContent()
		await browser.switchTo().frame('frame-middle')
		await browser.switchTo().defaultContent()
		await browser.switchTo().frame('frame-right')
		await browser.switchTo().defaultContent()
	})
}
