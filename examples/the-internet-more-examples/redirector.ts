import { step, TestSettings, Until, By, beforeEach, Mouse } from '@flood/element'
import assert from 'assert'

/**
 * Author: Hong La : hong@flood.io
 * Flood IO
 */

export const settings: TestSettings = {
	loopCount: 1,
	disableCache: true,
	actionDelay: 1,
	stepDelay: 2,
	incognito: true,
	waitTimeout: 60,
}

const URL = 'https://the-internet.herokuapp.com/'

export default () => {
	beforeEach(async browser => {
		await browser.visit(`${URL}/redirector`)

		const pageTextVerified = By.css('#content h3')
		await browser.wait(Until.elementIsVisible(pageTextVerified))

		assert.strictEqual(
			await (await browser.findElement(pageTextVerified)).text(),
			'Redirection',
			'The title should be correct',
		)
	})

	step('Find redirect link and click into it', async browser => {
		const redirectLink = await browser.findElement(By.linkText('here'))

		// ElementHandle.takeScreenshot(withOptions)
		await redirectLink.takeScreenshot({
			path: 'redirectLink.jp',
			type: 'png',
			encoding: 'base64',
		})

		// ElementHandle.takeScreenshot(withoutOptions)
		await redirectLink.takeScreenshot()

		// ElementHandle.getId()
		const linkId = await redirectLink.getId()

		assert.strictEqual(linkId, 'redirect', 'The id of the redirect link should be correct')

		await browser.mouse.click(redirectLink)

		// Browser.waitForNavigation()
		await browser.waitForNavigation()

		// Get Status Code List by browser.evaluate
		const statusCodeList: string[] = await browser.evaluate(() => {
			const elements = document.getElementsByTagName('li')
			const result: string[] = []

			Array.from(elements).forEach(element => {
				result.push(element.textContent)
			})

			return result
		})

		assert.strictEqual(
			statusCodeList.length,
			4,
			'The standard status code list should have 4 codes',
		)

		const expectedStatusCodeList = ['200', '301', '404', '500']
		statusCodeList.forEach(code => {
			assert(expectedStatusCodeList.includes(code), 'Each standard status code should be correct')
		})
	})
}
