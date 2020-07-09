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
	step('Test: 01 - Homepage', async browser => {
		await browser.visit(URL)
		await browser.wait(Until.elementIsVisible(By.css('#content > h1')))
		let pageTextVerify = By.visibleText('Welcome to the-internet')
		await browser.wait(Until.elementIsVisible(pageTextVerify))
	})

	step('Test: 02 - Large - Deep DOM', async browser => {
		await browser.visit(URL + '/large')
		let pageTextVerify = By.visibleText('Large & Deep DOM')
		await browser.wait(Until.elementIsVisible(pageTextVerify))
	})

	step('Test: 03 - Elements', async browser => {
		let Table = await browser.findElement(By.xpath("//tr[@class='row-50']/td[@class='column-50']"))
		const Text = await Table.text()
		console.log('Last column and row: ' + Text)
		assert(Text === '50.50', 'Text value is correct')
	})
}
