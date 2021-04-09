import { Until, TestSettings, step, By } from '@flood/element'

export const settings: TestSettings = {
	loopCount: 1,
}

export default () => {
	step(async (browser) => {
		await browser.visit('https://the-internet.herokuapp.com/checkboxes')
		await Promise.all([
			browser.wait(Until.urlDoesNotMatch(/([A-Za-z]):([A-Za-z])/)),
			browser.wait(Until.titleDoesNotMatch(/([A-Za-z]):([A-Za-z])/)),
		])

		const checkboxes = await browser.findElements(By.tagName('input'))

		await checkboxes[0].click()
		await browser.wait(Until.elementIsSelected(checkboxes[0]))
		await checkboxes[1].click({ clickCount: 3 })
		await browser.wait(Until.elementIsNotSelected(checkboxes[1]))
	})
}
