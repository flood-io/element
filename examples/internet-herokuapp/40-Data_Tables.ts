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

	step('Test: 02 - Data Tables', async browser => {

		await browser.visit(URL+'/tables')
		await browser.wait(Until.elementIsVisible(By.css('#content > div > h3')))
		let pageTextVerify = By.visibleText('Data Tables')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

	})

	step('Test: 03 - Table 1', async browser => {

		let Table1 = await browser.findElement(By.css('#table1 > tbody > tr:nth-child(4) > td:nth-child(5)'))
		const Value1 = await Table1.text()
		console.log('Table 1 - Col 5 Row 4 Value: ' + Value1)

		let Table11 = await browser.findElement(By.css('#table1 > tbody > tr:nth-child(4) > td:nth-child(1)'))
		const Value11 = await Table11.text()
		console.log('Table 1 - Col 1 Row 4 Value: ' + Value11)

	})

	step('Test: 04 - Table 2', async browser => {

		let Table2 = await browser.findElement(By.css('#table2 > tbody > tr:nth-child(2) > td.dues'))
		const Value2 = await Table2.text()
		console.log('Table 2 - Col 4 Row 2 Value: ' + Value2)

		let Table22 = await browser.findElement(By.css('#table2 > tbody > tr:nth-child(1) > td.email'))
		const Value22 = await Table22.text()
		console.log('Table 2 - Col 3 Row 1 Value: ' + Value22)

	})

}