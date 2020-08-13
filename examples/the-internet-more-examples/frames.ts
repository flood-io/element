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
	waitTimeout: 60,
	screenshotOnFailure: true,
}

/**
 * Author: Hong La : hong@flood.io
 * The Internet - Heroku App
 */

const URL = 'https://the-internet.herokuapp.com'
const floodIOURL = 'https://flood.io'
const mozillaDblClickURL =
	'https://mdn.mozillademos.org/en-US/docs/Web/API/Element/dblclick_event$samples/Examples'

const goToFramesPage = async browser => {
	await browser.visit(`${URL}/frames`)
	const pageTextVerify: Locator = By.visibleText('Frames')
	await browser.wait(Until.elementIsVisible(pageTextVerify))
}

export default () => {
	step('Test: Go to the homepage', async browser => {
		await browser.visit(URL)
		await browser.wait(Until.elementIsVisible(By.css('#content > h1')))
		const pageTextVerify = By.visibleText('Welcome to the-internet')
		await browser.wait(Until.elementIsVisible(pageTextVerify))
	})

	step('Test: Go to Frames page', async browser => {
		await goToFramesPage(browser)
	})

	step(
		'Test: Go to Nested Frame, use Until.ableToSwitchToFrame and find Element with By.nameAttr',
		async browser => {
			const nestedFrameEl = await browser.findElement(By.partialLinkText('Nested Frames'))
			await nestedFrameEl.click()

			// Until.ableToSwitchToFrame example
			await browser.wait(Until.ableToSwitchToFrame('frame-bottom'))

			// An example of using By.nameAttr
			const bottomFrameEl = await browser.findElement(By.nameAttr('frame-bottom'))
			// Example of TargetLocator.activeElement
			const activeEl = await browser.switchTo().activeElement()
			const activeElTagName = await activeEl.tagName()
			assert(
				activeElTagName.toLowerCase() === 'frameset',
				'The active element tagname should be frameset',
			)

			// Example of TargetLocator.frame(ElementHandle)
			await browser.switchTo().frame(bottomFrameEl)
			const bottomBody = await browser.findElement(By.tagName('body'))
			const bottomText = await bottomBody.text()
			assert(bottomText === 'BOTTOM', 'The inner text of the bottom frame should be BOTTOM')

			// TargetLocator.frame(id|name)
			await browser.switchTo().frame('frame-top')
			await browser.wait(Until.ableToSwitchToFrame('frame-right'))
			await browser.switchTo().frame('frame-right')
			const rightBody = await browser.findElement(By.tagName('body'))
			const rightText = await rightBody.text()

			assert(rightText === 'RIGHT', 'The inner text of the right frame should be RIGHT')
		},
	)

	step('Test: Go to flood.io and use Until.titleContains and Until.urlContains', async browser => {
		await browser.switchTo().defaultContent()

		await browser.visit(floodIOURL)
		// Until.titleContains example
		await browser.wait(Until.titleContains('Flood'))
		const floodTitle = await browser.title()
		assert(
			floodTitle === 'Scalable software starts here - Flood',
			'The title of Flood page should be correct',
		)

		const whyFloodEl = await browser.findElement(By.visibleText('Why Flood?'))
		await whyFloodEl.click()
		// Util.urlContains example
		await browser.wait(Until.urlContains('what-is-flood'))
		await browser.wait(Until.elementIsVisible(By.css('h1.headline-2')))
		const headingEl = await browser.findElement(By.tagName('h1'))
		const headingText = await headingEl.text()
		assert(
			headingText === 'Flood is an easy to use load testing platform',
			'The heading should be correct',
		)
	})

	step('Test: Double Click Event', async browser => {
		await browser.switchTo().defaultContent()
		await browser.visit(mozillaDblClickURL)

		const pageTextVerify = By.visibleText('My Card')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

		const asideEl = await browser.findElement(By.tagName('aside'))
		await browser.doubleClick(asideEl)
		const asideLargeClass = await asideEl.getAttribute('class')
		assert(
			asideLargeClass.toLowerCase() === 'large',
			'The aside should have large class after be dblclicked',
		)

		await browser.wait(5)
	})
}
