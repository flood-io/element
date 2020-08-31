import { step, TestSettings, Until, By } from '@flood/element'

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

	step('Test: 02 - Disappearing Elements', async browser => {
		await browser.visit(URL + '/disappearing_elements')
		await browser.wait(Until.elementIsVisible(By.css('#content > div')))
	})

	step('Test: 03 - Gallery is Displayed', async browser => {
		let Gallery = await browser.maybeFindElement(
			By.css('#content > div > ul > li:nth-child(5) > a'),
		)
		if (Gallery != null) {
			let isDisplayed = await Gallery.isDisplayed()
			if (isDisplayed) {
				await Gallery.click()
			}
		}
	})
}
