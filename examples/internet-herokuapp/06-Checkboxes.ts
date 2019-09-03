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

	step('Test: 02 - Checkboxes', async browser => {

		await browser.visit(URL+'/checkboxes')
		await browser.wait(Until.elementIsVisible(By.css('#content > div')))

	})

	step('Test: 03 - Uncheck box', async browser => {

		let Checkbox = await browser.findElement(By.css('#checkboxes > input[type=checkbox]:nth-child(1)'))
		await Checkbox.click()

	})

	step('Test: 04 - Check box', async browser => {

		let Checkbox = await browser.findElement(By.css('#checkboxes > input[type=checkbox]:nth-child(1)'))
		await Checkbox.click()

	})

}