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

	step('Test: 02 - Status Codes', async (browser) => {
		await browser.visit(URL + '/status_codes')
		await browser.wait(Until.elementIsVisible(By.css('#content > div > h3')))
		const pageTextVerify = By.visibleText('Status Codes')
		await browser.wait(Until.elementIsVisible(pageTextVerify))
	})

	step('Test: 03 - Status Codes - Code 200', async (browser) => {
		const link200 = await browser.findElement(By.css('#content > div > ul > li:nth-child(1) > a'))
		await link200.click()
		const pageTextVerify200 = By.visibleText('200')
		await browser.wait(Until.elementIsVisible(pageTextVerify200))
	})

	step('Test: 04 - Status Codes - Return', async (browser) => {
		const linkback = await browser.findElement(By.css('#content > div > p > a'))
		await linkback.click()
	})

	step('Test: 05 - Status Codes - Code 301', async (browser) => {
		const link301 = await browser.findElement(By.css('#content > div > ul > li:nth-child(2) > a'))
		await link301.click()
		const pageTextVerify301 = By.visibleText('301')
		await browser.wait(Until.elementIsVisible(pageTextVerify301))
	})

	step('Test: 06 - Status Codes - Return', async (browser) => {
		const linkback = await browser.findElement(By.css('#content > div > p > a'))
		await linkback.click()
	})

	step('Test: 07 - Status Codes - Code 404', async (browser) => {
		const link404 = await browser.findElement(By.css('#content > div > ul > li:nth-child(3) > a'))
		await link404.click()
		const pageTextVerify404 = By.visibleText('404')
		await browser.wait(Until.elementIsVisible(pageTextVerify404))
	})

	step('Test: 08 - Status Codes - Return', async (browser) => {
		const linkback = await browser.findElement(By.css('#content > div > p > a'))
		await linkback.click()
	})

	step('Test: 09 - Status Codes - Code 500', async (browser) => {
		const link500 = await browser.findElement(By.css('#content > div > ul > li:nth-child(4) > a'))
		await link500.click()
		const pageTextVerify500 = By.visibleText('500')
		await browser.wait(Until.elementIsVisible(pageTextVerify500))
	})

	step('Test: 10 - Status Codes - Return', async (browser) => {
		const linkback = await browser.findElement(By.css('#content > div > p > a'))
		await linkback.click()
	})
}
