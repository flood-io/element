import { step, TestSettings, Until, By, Device } from '@flood/element'
import * as assert from 'assert'

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
	DOMSnapshotOnFailure: true
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

	step('Test: 02 - Hovers', async browser => {

		await browser.visit(URL+'/hovers')
		await browser.wait(Until.elementIsVisible(By.css('#content > div > h3')))
		let pageTextVerify = By.visibleText('Hovers')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

	})

	step('Test: 03 - Image 1', async browser => {

		let Image = await browser.findElement(By.css('#content > div > div:nth-child(3) > img'))
		await Image.click()
		let pageTextVerify = By.css('#content > div > div:nth-child(3) > div > a')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

	})

	step('Test: 04 - Image 2', async browser => {

		let Image = await browser.findElement(By.css('#content > div > div:nth-child(4) > img'))
		await Image.click()
		let pageTextVerify = By.css('#content > div > div:nth-child(4) > div > a')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

	})

	step('Test: 05 - Image 3', async browser => {

		let Image = await browser.findElement(By.css('#content > div > div:nth-child(5) > img'))
		await Image.click()
		let pageTextVerify = By.css('#content > div > div:nth-child(5) > div > a')
		await browser.wait(Until.elementIsVisible(pageTextVerify))
		let Profile = await browser.findElement(By.css('#content > div > div:nth-child(5) > div > a'))
		await Profile.click()

	})

}