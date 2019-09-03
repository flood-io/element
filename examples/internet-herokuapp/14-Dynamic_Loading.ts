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

	step('Test: 02 - Dynamic Loading', async browser => {

		await browser.visit(URL+'/dynamic_loading')
		let pageTextVerify = By.visibleText('Dynamically Loaded')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

	})

	step('Test: 03 - Dynamically Loaded Page Elements', async browser => {

		let Link = await browser.findElement(By.css('#content > div > a:nth-child(8)'))
		await Link.click()
		let pageTextVerify = By.visibleText('Example 2')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

	})

	step('Test: 04 - Element rendered after the fact', async browser => {

		let Add = await browser.findElement(By.css('#start > button'))
		await Add.click()

	})

	step('Test: 05 - Hello World', async browser => {

		let pageTextVerify = By.visibleText('Hello World')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

	})

}