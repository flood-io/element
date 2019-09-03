import { step, TestSettings, Until, By, Device, Key } from '@flood/element'
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

	step('Test: 02 - File Upload', async browser => {

		await browser.visit(URL+'/upload')
		await browser.wait(Until.elementIsVisible(By.css('#content > div > h3')))
		let pageTextVerify = By.visibleText('File Upload')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

	})

	step('Test: 03 - Choose File', async browser => {

		let fileInput = await browser.findElement('input[type="file"]')
		await fileInput.uploadFile("test.ts")

	})

	step('Test: 03 - Choose File', async browser => {

		let Submit = await browser.findElement(By.css('#file-submit'))
		await Submit.click()

	})

}