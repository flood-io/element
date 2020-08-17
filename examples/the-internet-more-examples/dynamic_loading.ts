import { step, TestSettings, Until, By } from '@flood/element'

export const settings: TestSettings = {
	clearCache: false,
	disableCache: false,
	clearCookies: false,
	loopCount: 1,
	duration: -1,
	actionDelay: 2,
	stepDelay: 2,
	waitTimeout: 60,
}

/**
 * Author: Antonio Jimenez : antonio@flood.io
 * The internet - heroku App
 * @version 1.1
 */

const URL = 'https://the-internet.herokuapp.com/dynamic_loading'

export default () => {
	step('Test: 01 - Dynamic loading page', async browser => {
		await browser.visit(URL)
		let locator = By.partialVisibleText('Element')
		await browser.wait(Until.elementLocated(locator))
		await Until.elementIsNotVisible(locator)
		await Until.elementTextDoesNotContain(locator, 'Elemental Selenium')
	})
}
