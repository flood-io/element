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

	step('Test: 02 - Add/Remove Elements', async browser => {

		await browser.visit(URL+'/add_remove_elements/')
		let pageTextVerify = By.visibleText('Add/Remove Elements')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

	})

	step('Test: 03 - Add a new Element', async browser => {

		let AddButton = await browser.findElement(By.css('#content > div > button'))
		await AddButton.click()
		let NewButton = By.css('#elements > button:nth-child(1)')
		await browser.wait(Until.elementIsVisible(NewButton))

	})

	step('Test: 04 - Remove Element', async browser => {

		let RemoveButton = await browser.findElement(By.css('#elements > button:nth-child(1)'))
		await RemoveButton.click()
		let NewButton = By.css('#elements > button:nth-child(1)')
		let Removed = await browser.maybeFindElement(NewButton)
		if ( Removed != null ){
			console.error('The Button was not removed')
		}
		else{
			console.log("The Button was removed")
		}

	})

}