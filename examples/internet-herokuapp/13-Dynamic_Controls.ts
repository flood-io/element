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
	step('Test: 01 - Homepage', async browser => {
		await browser.visit(URL)
		await browser.wait(Until.elementIsVisible(By.css('#content > h1')))
		let pageTextVerify = By.visibleText('Welcome to the-internet')
		await browser.wait(Until.elementIsVisible(pageTextVerify))
	})

	step('Test: 02 - Dynamic Controls', async browser => {
		await browser.visit(URL + '/dynamic_controls')
		await browser.wait(Until.elementIsVisible(By.css('#checkbox-example > button')))
		let pageTextVerify = By.visibleText('Dynamic Controls')
		await browser.wait(Until.elementIsVisible(pageTextVerify))
	})

	step('Test: 03 - Dynamic Controls - Checkbox Remove', async browser => {
		let Checkbox = await browser.findElement(By.css('#checkbox > input[type=checkbox]'))
		await Checkbox.click()
		let Remove = await browser.findElement(By.css('#checkbox-example > button'))
		await Remove.click()
	})

	step('Test: 04 - Dynamic Controls - Add', async browser => {
		let pageTextVerify = By.visibleText("It's gone!")
		await browser.wait(Until.elementIsVisible(pageTextVerify))
		let Remove = await browser.findElement(By.css('#checkbox-example > button'))
		await Remove.click()
	})

	step('Test: 05 - Dynamic Controls - Is Back!', async browser => {
		let pageTextVerify = By.visibleText("It's back!")
		await browser.wait(Until.elementIsVisible(pageTextVerify))
	})
}
