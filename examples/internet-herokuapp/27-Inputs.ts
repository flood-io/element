import { step, TestSettings, Until, By, Device, Key } from '@flood/element'
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

	step('Test: 02 - Inputs', async (browser) => {
		await browser.visit(URL + '/inputs')
		await browser.wait(Until.elementIsVisible(By.css('#content > div')))
	})

	step('Test: 03 - Input Enter value', async (browser) => {
		const Input = By.css('input[type="number"]')
		await browser.wait(Until.elementIsVisible(Input))
		await browser.type(Input, 'abcd')
		const ValInput = await browser.findElement(Input)
		const Value = await ValInput.getAttribute('value')
		if (Value == null) {
			console.log(' The field is clear, not accepting alpha')
			await browser.type(Input, '2')
		} else {
			console.error(' The field is accepting alpha ' + Value)
		}
	})
}
