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

const URL = 'https://the-internet.herokuapp.com/hovers'

export default () => {
	step('Test: 01 - Hovers page', async browser => {
		await browser.visit(URL)
		await Until.titleIsNot('Wrong title')
		await Until.urlIsNot('Wrong url')
		let locator = By.attr('a', 'target', '_blank')
		await browser.wait(Until.elementLocated(locator))
		await Until.elementTextContains(locator, 'Elemental Selenium')
	})

	step('Test: 02 - Image', async browser => {
		let Image = await browser.findElement(By.css('#content > div > div:nth-child(3) > img'))
		await Image.getProperty('src')
		let imageLocation = await Image.centerPoint()
		await browser.mouse.click(imageLocation[0], imageLocation[1])
	})
}
