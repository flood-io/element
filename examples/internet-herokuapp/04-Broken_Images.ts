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

	step('Test: 02 - Basic Auth', async (browser) => {
		await browser.visit(URL + '/broken_images')
		await browser.wait(Until.elementIsVisible(By.css('#content > div > h3')))
	})

	step('Test: 03 - Images', async (browser) => {
		const ArrayImg = await browser.findElements(By.tagName('img'))
		assert(ArrayImg.length > 0, 'expected to find some images')
		console.log('Number of images found: ' + ArrayImg.length)
		for (const Image of ArrayImg) {
			const Src = await Image.getAttribute('src')
			console.log('Image Source: ' + Src)
		}
	})
}
