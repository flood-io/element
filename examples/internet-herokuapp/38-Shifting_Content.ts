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

	step('Test: 02 - Shifting Content', async browser => {

		await browser.visit(URL+'/shifting_content')
		await browser.wait(Until.elementIsVisible(By.css('#content > div > h3')))
		let pageTextVerify = By.visibleText('Shifting Content')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

	})

	step('Test: 03 - Shifting Content: Image', async browser => {

		let linkHref = await browser.findElement(By.css('#content > div > a:nth-child(6)'))
		await linkHref.click()
		await browser.wait(Until.elementIsVisible(By.css('#content > div > img')))
		let pageTextVerify = By.visibleText('Shifting Content: Image')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

	})

	step('Test: 04 - Randomly', async browser => {

		let linkHref = await browser.findElement(By.css('#content > div > p:nth-child(3) > a'))
		await linkHref.click()
		await browser.wait(Until.elementIsVisible(By.css('#content > div > img')))
		let pageTextVerify = By.visibleText('Shifting Content: Image')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

	})

	step('Test: 05 - 100px Shifting', async browser => {

		let linkHref = await browser.findElement(By.css('#content > div > p:nth-child(4) > a'))
		await linkHref.click()
		await browser.wait(Until.elementIsVisible(By.css('#content > div > img')))
		let pageTextVerify = By.visibleText('Shifting Content: Image')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

	})

	step('Test: 06 - 100px Shifting + Randomly', async browser => {

		let linkHref = await browser.findElement(By.css('#content > div > p:nth-child(5) > a'))
		await linkHref.click()
		await browser.wait(Until.elementIsVisible(By.css('#content > div > img')))
		let pageTextVerify = By.visibleText('Shifting Content: Image')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

	})

	step('Test: 07 - 100px Shifting + Randomly', async browser => {

		let linkHref = await browser.findElement(By.css('#content > div > p:nth-child(6) > a'))
		await linkHref.click()
		await browser.wait(Until.elementIsVisible(By.css('#content > div > img')))
		let pageTextVerify = By.visibleText('Shifting Content: Image')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

	})

}