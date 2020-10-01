import { step, TestSettings, By } from '@flood/element'

export const settings: TestSettings = {
	loopCount: 1,
	waitUntil: 'visible',
	clearCache: false,
	clearCookies: false,
	disableCache: false,
	waitTimeout: '60s',
	screenshotOnFailure: true,
	viewport: { width: 1600, height: 900 },
	launchArgs: ['--window-size=1600,900'],
	stepDelay: '500ms',
	actionDelay: '1s',
}

const URL = 'http://127.0.0.1:5500/index.html'

export default () => {
	step('[01] -  Test Scroll with Target is Point and ScrollDirection', async browser => {
		await browser.visit(URL)
		await browser.wait(2)
		await browser.scrollTo('bottom', 'smooth')
		await browser.wait(2)
		await browser.scrollTo('top', 'smooth')

		await browser.wait(2)
		await browser.scrollTo([400, 1000], 'smooth')

		await browser.wait(2)

		await browser.scrollTo('right', 'smooth')
		await browser.wait(2)
		await browser.scrollTo('left', 'smooth')
		await browser.wait(2)

		const button = By.css('.btn')
		await browser.scrollTo(button, 'smooth')

		await browser.wait(2)
		const paragraph = await browser.findElement(By.css('p'))
		await browser.scrollTo(paragraph, 'smooth')
		await browser.wait(10)
	})
}
