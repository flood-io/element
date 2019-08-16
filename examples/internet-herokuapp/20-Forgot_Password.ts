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

	step('Test: 02 - Forgot Password', async browser => {

		await browser.visit(URL+'/forgot_password')
		let pageTextVerify = By.visibleText('Forgot Password')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

	})

	step('Test: 03 - Enter email', async browser => {

		let Email = By.css('#email')
		await browser.wait(Until.elementIsVisible(Email))
		let EmailBox = await browser.findElement(Email)
		await EmailBox.click()
		await browser.type(EmailBox, "antonio@flood.io")

		let Retrieve = By.css('#form_submit')
		await browser.wait(Until.elementIsVisible(Retrieve))
		let RetrieveButton = await browser.findElement(Retrieve)
		await RetrieveButton.click()

	})

}