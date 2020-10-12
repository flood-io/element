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

		console.info('[INFO]: ScrollTo with param is ScrollDirection bottom')
		await browser.scrollTo('bottom', { behavior: 'smooth' })
		await browser.wait(2)

		console.info('[INFO]: ScrollTo with param is ScrollDirection top')
		await browser.scrollTo('top', { behavior: 'smooth' })
		await browser.wait(2)

		console.info('[INFO]: ScrollTo with param is Point')
		await browser.scrollTo([500, 1000], { behavior: 'smooth' })
		await browser.wait(2)

		console.info('[INFO]: ScrollTo with param is ScrollDirection right')
		await browser.scrollTo('right', { behavior: 'smooth' })
		await browser.wait(2)

		console.info('[INFO]: ScrollTo with param is ScrollDirection left')
		await browser.scrollTo('left', { behavior: 'smooth' })
		await browser.wait(2)

		console.info('[INFO]: ScrollTo with param is Locator')
		const button = By.css('.btn')
		await browser.scrollTo(button, { behavior: 'smooth', block: 'center', inline: 'center' })
		await browser.wait(2)

		console.info('[INFO]: ScrollTo with param is ElementHandle')
		const paragraph = await browser.findElement(By.css('p'))
		await browser.scrollTo(paragraph, { behavior: 'smooth', block: 'nearest' })
		await browser.wait(2)

		const beforeScrollTop = await browser.evaluate(() => ({
			pageXOffset: window.pageXOffset,
			pageYOffset: window.pageYOffset,
		}))
		console.log(beforeScrollTop)
		await browser.wait(2)

		console.info('[INFO]: ScrollBy without ScrollOptions')
		await browser.scrollBy(700, 400)
		await browser.wait(2)
		const afterScrollTop = await browser.evaluate(() => ({
			pageXOffset: window.pageXOffset,
			pageYOffset: window.pageYOffset,
		}))
		console.log(afterScrollTop)

		console.info('[INFO]: ScrollBy with ScrollOptions')
		await browser.scrollBy(0, -400, { behavior: 'smooth' })
		await browser.wait(2)
		const afterScrollAgain = await browser.evaluate(() => ({
			pageXOffset: window.pageXOffset,
			pageYOffset: window.pageYOffset,
		}))
		console.log(afterScrollAgain)

		await browser.scrollTo([0, 0])
		await browser.wait(2)

		// Using scrollBy with special value window.innerHeight or window.innerWidth
		// We can get the innerHeight by browser.evaluate() then pass it as a param in browser.scrollBy()
		const innerHeight: number = await browser.evaluate(() => window.innerHeight)
		console.info('[INFO]: ScrollBy with window.innerHeight')
		await browser.scrollBy(0, innerHeight, { behavior: 'smooth' })
		await browser.wait(2)

		// Or we can use the string 'window.innerWidth' and pass it as param in browser.scrollBy()
		console.info('[INFO]: ScrollBy with innerWidth')
		await browser.scrollBy('window.innerWidth', 0, { behavior: 'smooth' })
		await browser.wait(10)
	})
}
