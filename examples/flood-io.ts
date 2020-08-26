import { step, Until, By, TestSettings } from '@flood/element'
import assert from 'assert'

/**
 * Author: Hong La : hong@flood.io
 * Flood IO
 */

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

const URL = 'https://flood.io'

export default () => {
	step('Test: Go to flood.io and use Until.titleContains and Until.urlContains', async browser => {
		await browser.visit(URL)

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
		await browser.wait(Until.urlContains('what-is'))
		await browser.wait(Until.elementIsVisible(By.css('h1.headline-2')))
		const headingEl = await browser.findElement(By.tagName('h1'))
		const headingText = await headingEl.text()
		assert(
			headingText === 'Flood is an easy to use load testing platform',
			'The heading should be correct',
		)
	})

	step(
		'Test: Go to Pricing and check Title, URL by Until.titleDoesNotContain, Until.urlDoesNotContain',
		async browser => {
			await browser.visit(`${URL}/pricing`)

			// Until.titleDoesNotContain(title: string)
			await browser.wait(Until.titleDoesNotContain('What is Flood'))
			const title = await browser.title()
			assert(!title.includes('What is Flood'), 'The new title should not include the old title')

			const getStartedButtonEl = By.partialLinkText('Get Started')
			// Until.elementsLocated(selectorOrLocator: NullableLocatable, desiredCount = 2)
			await browser.wait(Until.elementsLocated(getStartedButtonEl, 2))
			const getStartedButton = await browser.findElement(getStartedButtonEl)
			await browser.click(getStartedButton)

			// Until.urlDoesNotContain(url: string)
			await browser.wait(Until.urlDoesNotContain('pricing'))
			const heading = By.css('h3')

			// Until.elementsLocated(selectorOrLocator: NullableLocatable, desiredCount = 1)
			await browser.wait(Until.elementsLocated(heading))
			const headingText = await (await browser.findElement(heading)).text()
			assert.strictEqual(
				headingText,
				'Ready to get started?',
				'The heading of Flood sign up page should be correct',
			)
		},
	)
}
