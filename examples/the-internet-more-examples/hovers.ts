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
		let image = await browser.findElement(By.css('#content > div > div:nth-child(3) > img'))
		await image.getProperty('src')
		let imageLocation = await image.centerPoint()
		await browser.mouse.click(image, { delay: 150 })
		await browser.mouse.click(image)
		await browser.mouse.click(imageLocation[0], imageLocation[1], { delay: 100 })
		await browser.mouse.click(imageLocation[0], imageLocation[1])
		await browser.mouse.click(imageLocation, { delay: 150 })
		await browser.mouse.click(imageLocation)
	})
}
