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

	step('Test: 02 - JQueryUI', async browser => {

		await browser.visit(URL+'/jqueryui/menu')
		let pageTextVerify = By.visibleText('JQueryUI')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

	})

	step('Test: 03 - Menu', async browser => {

		let Menu = await browser.findElement(By.css('#ui-id-3'))
		await Menu.focus()
		await Menu.click()

	})

	step('Test: 04 - SubMenu', async browser => {

		let SubMenu = await browser.findElement(By.css('#ui-id-4'))
		await SubMenu.focus()
		await SubMenu.click()

	})

	step('Test: 05 - PDF', async browser => {

		let PDF = await browser.findElement(By.css('#ui-id-5'))
		await PDF.focus()
		await PDF.click()

	})

}