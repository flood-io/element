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

export default () => {
	step('Test: 01 - Dynamic loading page', async (browser) => {
		await browser.visit('https://the-internet.herokuapp.com/dynamic_loading/1')
		await browser.wait(Until.elementLocated(By.partialVisibleText('Example 1')))
		await browser.click(By.css('#start > button'))
		await browser.wait(Until.elementIsNotVisible(By.id('loading')))
		await browser.wait(Until.elementTextDoesNotContain(By.css('#finish > h4'), 'World!!'))
	})
}
