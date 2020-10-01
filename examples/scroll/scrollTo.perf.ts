import { step, TestSettings } from '@flood/element'

export const settings: TestSettings = {
	loopCount: 1,
	waitUntil: 'visible',
	clearCache: false,
	clearCookies: false,
	disableCache: false,
	waitTimeout: '10s',
	screenshotOnFailure: true,
	viewport: { width: 800, height: 600 },
	launchArgs: ['--window-size=800,600'],
	stepDelay: '500ms',
	actionDelay: '1s',
}

const URL = 'http://127.0.0.1:5500/index.html'

export default () => {
	step('[01] -  Test Scroll with Target is Point and ScrollDirection', async browser => {
		await browser.visit(URL)
		await browser.wait(2)
		await browser.scrollTo('bottom', 'smooth')
		await browser.wait(5)
		await browser.scrollTo('top', 'smooth')

		await browser.wait(5)
		await browser.scrollTo([300, 300])

		await browser.wait(5)

		await browser.scrollTo('right')
		await browser.wait(5)
		await browser.scrollTo('left', 'smooth')
		await browser.wait(10)
	})
}
