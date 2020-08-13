import { step, TestSettings, Until, By, Locator } from '@flood/element'
import assert from 'assert'

export const settings: TestSettings = {
	clearCache: false,
	disableCache: false,
	clearCookies: false,
	loopCount: 1,
	duration: 1,
	actionDelay: 2,
	stepDelay: 2,
	waitTimeout: 600,
	screenshotOnFailure: true,
}

/**
 * Author: Hong La : hong@flood.io
 * The Internet - Heroku App
 */

const URL = 'https://the-internet.herokuapp.com'

const goToFramesPage = async browser => {
	await browser.visit(`${URL}/frames`)
	const pageTextVerify: Locator = By.visibleText('Frames')
	await browser.wait(Until.elementIsVisible(pageTextVerify))
}

export default () => {
	step('Test: Go to the homepage', async browser => {
		await browser.visit(URL)
		await browser.wait(Until.elementIsVisible(By.css('#content > h1')))
		const pageTextVerify: Locator = By.visibleText('Welcome to the-internet')
		await browser.wait(Until.elementIsVisible(pageTextVerify))
	})

	step('Test: Go to Frames page', async browser => {
		await goToFramesPage(browser)
	})

	step('Test: Go to Nested Frame using Until.ableToSwitchToFrame', async browser => {
		const nestedFrameEl = await browser.findElement(By.partialLinkText('Nested Frames'))
		await nestedFrameEl.click()

		await browser.wait(Until.ableToSwitchToFrame('frame-bottom'))

		const bottomFrameEl = await browser.findElement(By.nameAttr('frame-bottom'))
		await browser.switchTo().frame(bottomFrameEl)
		const bottomBody = await browser.findElement(By.tagName('body'))
		const bottomText = await bottomBody.text()
		assert(bottomText === 'BOTTOM', 'The inner text of the bottom frame is BOTTOM')
	})

	step('Test: Go back to Frames page', async browser => {
		await browser.switchTo().defaultContent()
		await goToFramesPage(browser)
	})

	step('Test: Go to iFrame and use Until.titleContains and Until.urlContains', async browser => {
		const iFrameEl = await browser.findElement(By.partialLinkText('iFrame'))
		await iFrameEl.click()

		await browser.wait(Until.titleContains('The Internet'))

		const titleEl = await browser.findElement(By.css('h3'))
		const titleText = await titleEl.text()
		assert(titleText.includes('TinyMCE'), 'The title of the page should include text TinyMCE')
	})
}
