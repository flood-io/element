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
	stepDelay: '1s',
	actionDelay: '500ms',
}

const URL = 'https://testscroll.hongla.dev/'

export default () => {
	step('[01] -  Test Scroll with Target is Point and ScrollDirection', async browser => {
		await browser.visit(URL)
		await browser.wait(2)
		await browser.scrollTo('bottom', { behavior: 'smooth' })
		await browser.wait(2)
		await browser.scrollTo('top', { behavior: 'smooth' })

		await browser.wait(2)
		await browser.scrollTo([500, 1000], { behavior: 'smooth' })

		await browser.wait(2)

		await browser.scrollTo('right', { behavior: 'smooth' })
		await browser.wait(2)
		await browser.scrollTo('left', { behavior: 'smooth' })
		await browser.wait(2)

		const button = By.css('.btn')
		await browser.scrollTo(button, { behavior: 'smooth', block: 'center', inline: 'center' })

		await browser.wait(2)
		const paragraph = await browser.findElement(By.css('p'))
		await browser.scrollTo(paragraph, { behavior: 'smooth', block: 'nearest' })
		await browser.wait(2)
		const beforeScrollTop = await browser.evaluate(() => ({
			pageXOffset: window.pageXOffset,
			pageYOffset: window.pageYOffset,
		}))
		console.log(beforeScrollTop)
		await browser.wait(2)
		await browser.scrollBy(700, 400)
		await browser.wait(2)
		const afterScrollTop = await browser.evaluate(() => ({
			pageXOffset: window.pageXOffset,
			pageYOffset: window.pageYOffset,
		}))
		console.log(afterScrollTop)
		await browser.scrollBy(0, -400, { behavior: 'smooth' })
		await browser.wait(5)
		const afterScrollTop1 = await browser.evaluate(() => ({
			pageXOffset: window.pageXOffset,
			pageYOffset: window.pageYOffset,
		}))
		console.log(afterScrollTop1)
		await browser.wait(10)
	})
}
