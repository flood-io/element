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

const goToFramesPage = async (browser) => {
	await browser.visit(`${URL}/frames`)
	const pageTextVerify: Locator = By.visibleText('Frames')
	await browser.wait(Until.elementIsVisible(pageTextVerify))
}

export default () => {
	step('Test: Go to the homepage', async (browser) => {
		await browser.visit(URL)
		await browser.wait(Until.elementIsVisible(By.css('#content > h1')))
		const pageTextVerify = By.visibleText('Welcome to the-internet')
		await browser.wait(Until.elementIsVisible(pageTextVerify))
	})

	step('Test: Go to Frames page', async (browser) => {
		await goToFramesPage(browser)
	})

	step(
		'Test: Go to Nested Frame, use Until.ableToSwitchToFrame and find Element with By.nameAttr',
		async (browser) => {
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
				'The active element tagname should be frameset'
			)

			// Example of TargetLocator.frame(ElementHandle)
			await browser.switchTo().frame(bottomFrameEl)
			await browser.wait(1)
			const bottomBody = await browser.findElement(By.tagName('body'))
			const bottomText = await bottomBody.text()
			assert(bottomText === 'BOTTOM', 'The inner text of the bottom frame should be BOTTOM')

			// TargetLocator.frame(id|name)
			await browser.wait(Until.ableToSwitchToFrame('frame-top'))
			await browser.switchTo().frame('frame-top')
			await browser.wait(Until.ableToSwitchToFrame('frame-right'))
			await browser.switchTo().frame('frame-right')
			const rightBody = await browser.findElement(By.tagName('body'))
			const rightText = await rightBody.text()

			assert(rightText === 'RIGHT', 'The inner text of the right frame should be RIGHT')
		}
	)

	step('Test: Element Handle API', async (browser) => {
		await browser.switchTo().defaultContent()
		await browser.visit(`${URL}/login`)
		const pageTextVerify = By.css('#content h2')

		await browser.wait(Until.elementIsVisible(pageTextVerify))
		const step1UserNameInput = await browser.findElement(By.nameAttr('username'))
		const step1PasswordInput = await browser.findElement(By.nameAttr('password'))
		const step1SubmitBtn = await browser.findElement(By.css('button[type="submit"]'))

		// Element Hanlde Type
		await step1UserNameInput.type('tomsmith')
		await step1PasswordInput.type('SuperSecretPassword!')
		await step1SubmitBtn.click()

		await browser.wait(Until.elementIsVisible(By.visibleText('Logout')))
		await browser.click(By.visibleText('Logout'))

		await browser.wait(Until.elementIsVisible('#content h2'))

		const step2UserNameInput = await browser.findElement(By.nameAttr('username'))
		const step2PasswordInput = await browser.findElement(By.nameAttr('password'))
		const step2SubmitBtn = await browser.findElement(By.css('button[type="submit"]'))

		// Element Hanlde Focus
		await step2UserNameInput.focus()
		await browser.wait(3)
		await browser.takeScreenshot()

		// Element Handle Blur
		await step2UserNameInput.blur()
		await browser.wait(3)
		await browser.takeScreenshot()
		await step2UserNameInput.highlight()
		await browser.takeScreenshot()

		await step2PasswordInput.type('SuperSecretPassword!')
		// Element Handle Clear
		await step2PasswordInput.clear()
		await step2SubmitBtn.click()

		await browser.wait(Until.elementIsVisible(By.css('#flash')))

		const messageEl = await browser.findElement(By.css('#flash'))
		const messageClass = await messageEl.getAttribute('class')
		assert(messageClass.includes('error'), 'The message element should have class error.')

		await browser.wait(3)
	})
}
