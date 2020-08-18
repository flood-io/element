import { TestSettings, step, By, Until } from '@flood/element'
import assert from 'assert'

export const settings: TestSettings = {
	loopCount: 1,
}

export default () => {
	step('Clearing cookies', async browser => {
		const iconSun =
			'M20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69L23.31 12 20 8.69zM12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm0-10c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z'
		const iconMoon =
			'M20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69L23.31 12 20 8.69zM12 18c-.89 0-1.74-.2-2.5-.55C11.56 16.5 13 14.42 13 12s-1.44-4.5-3.5-5.45C10.26 6.2 11.11 6 12 6c3.31 0 6 2.69 6 6s-2.69 6-6 6z'

		await browser.visit('https://material-ui.com/')

		const toggleTheme = await browser.findElement(
			By.css('#__next > div > header > div > button:nth-child(9)'),
		)
		let icon = await browser.findElement(
			By.css(
				'#__next > div > header > div > button:nth-child(9) > span.MuiIconButton-label > svg > path',
			),
		)

		assert.strictEqual(await icon.getAttribute('d'), iconSun, 'Default theme is dark')
		await toggleTheme.click()

		// wait until the theme become light
		await browser.wait(Until.elementIsVisible(By.attr('path', 'd', iconMoon)))

		// clear cookies and reload the page by revisit it
		await browser.clearBrowserCookies()
		await browser.visit('https://material-ui.com/')

		// old execution context was destroyed because of navigation (the above browser.visit), need to find the toggle theme icon again
		icon = await browser.findElement(
			By.css(
				'#__next > div > header > div > button:nth-child(9) > span.MuiIconButton-label > svg > path',
			),
		)
		assert.strictEqual(
			await icon.getAttribute('d'),
			iconSun,
			'Theme was reset after cookies are cleared',
		)
	})
}
