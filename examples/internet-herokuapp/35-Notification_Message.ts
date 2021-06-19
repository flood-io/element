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

	step('Test: 02 - Notification Messages', async (browser) => {
		await browser.visit(URL + '/notification_message_rendered')
		const pageTextVerify = By.visibleText('Notification')
		await browser.wait(Until.elementIsVisible(pageTextVerify))
	})

	step('Test: 03 - Load new Message', async (browser) => {
		const NewMesg = await browser.findElement(By.css('#content > div > p > a'))
		await NewMesg.click()
	})

	step('Test: 04 - New Message', async (browser) => {
		const Flash = await browser.findElement(By.css('#flash'))
		const Text = await Flash.text()
		console.log('The Flash message says: ' + Text)

		const NewMesg = await browser.findElement(By.css('#content > div > p > a'))
		await NewMesg.click()
	})

	step('Test: 05 - New Message', async (browser) => {
		const Flash = await browser.findElement(By.css('#flash'))
		const Text = await Flash.text()
		console.log('The Flash message says: ' + Text)

		const NewMesg = await browser.findElement(By.css('#content > div > p > a'))
		await NewMesg.click()
	})
}
