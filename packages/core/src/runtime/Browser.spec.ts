import { serve } from '../../tests/support/fixture-server'
import { testWorkRoot } from '../../tests/support/test-run-env'
import { launchPuppeteer, testPuppeteer } from '../../tests/support/launch-browser'
import { Browser } from './Browser'
import { Until } from '../page/Until'
import { By } from '../page/By'
import { Key } from '../page/Enums'
import { DEFAULT_SETTINGS, normalizeSettings, TestSettings } from './Settings'

let puppeteer: testPuppeteer
const workRoot = testWorkRoot()

const getCurrentPosition = async (
	browser: Browser<any>,
): Promise<{ top: number; left: number }> => {
	return await browser.evaluate(() => ({
		top: document.documentElement.scrollTop || document.body.scrollTop,
		left: document.documentElement.scrollLeft || document.body.scrollLeft,
	}))
}

describe('Browser', () => {
	jest.setTimeout(30e3)
	beforeAll(async () => {
		puppeteer = await launchPuppeteer()

		puppeteer.page.on('console', msg =>
			console.log(`>> remote console.${msg.type()}: ${msg.text()}`),
		)
	})

	afterAll(async () => {
		await puppeteer.close()
	})

	test('fires callbacks on action command calls', async () => {
		const beforeSpy = jest.fn()
		const afterSpy = jest.fn()
		const setting: TestSettings = normalizeSettings(DEFAULT_SETTINGS)
		const browser = new Browser(
			workRoot,
			puppeteer,
			setting,
			async (_browser, actionName) => {
				beforeSpy(actionName)
			},
			async (_browser, actionName) => {
				afterSpy(actionName)
			},
		)
		const url = await serve('forms_with_input_elements.html')
		await browser.visit(url)

		expect(beforeSpy).toHaveBeenCalledWith('visit')
		expect(afterSpy).toHaveBeenCalledWith('visit')
	})

	test('throws an error', async () => {
		const setting: any = normalizeSettings(DEFAULT_SETTINGS)
		const browser = new Browser(
			workRoot,
			puppeteer,
			{ ...setting },
			async name => {},
			async name => {},
		)
		const url = await serve('forms_with_input_elements.html')
		await browser.visit(url)

		return expect(browser.click('.notanelement')).rejects.toEqual(
			new Error(`No element was found on the page using '.notanelement'`),
		)
	})

	test('returns active element', async () => {
		const setting: any = normalizeSettings(DEFAULT_SETTINGS)
		const browser = new Browser(workRoot, puppeteer, setting)

		const url = await serve('forms_with_input_elements.html')

		await browser.visit(url)
		const condition = Until.elementIsVisible(By.id('new_user_first_name'))
		condition.settings.waitTimeout = 31e3
		await browser.wait(condition)

		const el1 = await browser.switchTo().activeElement()
		expect(el1).toBeDefined()
		expect(el1).not.toBeNull()
		expect(await el1.getId()).toBe('new_user_first_name')
	})

	describe('Frame handling', () => {
		let browser: Browser<any>

		beforeEach(async () => {
			const setting: any = normalizeSettings(DEFAULT_SETTINGS)
			browser = new Browser(workRoot, puppeteer, setting)
			const url = await serve('frames.html')
			await browser.visit(url)
		})

		test('can list all frames', async () => {
			const frames = browser.frames
			expect(frames).toHaveLength(3)
			expect(frames.map(f => f.name())).toEqual(['', 'frame1', 'frame2'])
		})

		test('can switch frame by index', async () => {
			await browser.switchTo().frame(0)
			expect(browser.target.name()).toBe('frame1')
			await browser.switchTo().frame(1)
			expect(browser.target.name()).toBe('frame2')
			await browser.switchTo().defaultContent()
			expect(browser.target.name()).toBe('')
		})

		test('can switch frame by name', async () => {
			await browser.switchTo().frame('frame1')
			expect(browser.target.name()).toBe('frame1')
			await browser.switchTo().frame('frame2')
			expect(browser.target.name()).toBe('frame2')
			await browser.switchTo().defaultContent()
			expect(browser.target.name()).toBe('')
		})

		test('can switch frame using ElementHandle', async () => {
			const frame = await browser.findElement('frame[name="frame1"]')
			await browser.switchTo().frame(frame)
			expect(browser.target.name()).toBe('frame1')
		})

		test('can interact with another frame', async () => {
			await browser.switchTo().frame('frame1')
			expect(browser.target.name()).toBe('frame1')

			const input = await browser.findElement('input[name="senderElement"]')
			await input.clear()
			await input.type('Hello World')
			expect(await input.getProperty('value')).toBe('Hello World')
		})
	})

	describe('timing', () => {
		test.todo('it receives timing data')

		test.skip('can inject polyfill for TTI', async () => {
			const setting: any = normalizeSettings(DEFAULT_SETTINGS)
			const browser = new Browser(workRoot, puppeteer, setting)
			await browser.visit('https://www.google.com')

			const result = await browser.interactionTiming()
			expect(result).toBeGreaterThan(10)
		})
	})

	describe('auto waiting', () => {
		test('automatically applies a wait step to actions', async () => {
			const setting: any = normalizeSettings(DEFAULT_SETTINGS)
			const browser = new Browser(workRoot, puppeteer, {
				...setting,
				waitUntil: 'visible',
			})
			const url = await serve('wait.html')
			await browser.visit(url)

			await browser.click(By.id('add_select'))

			const link = await browser.findElement(By.id('languages'))
			const linkIsVisible = await link.isDisplayed()
			expect(linkIsVisible).toBe(true)
		})

		test('fails to return a visible link without waiting', async () => {
			const setting: any = normalizeSettings(DEFAULT_SETTINGS)
			const browser = new Browser(workRoot, puppeteer, setting)
			const url = await serve('wait.html')
			await browser.visit(url)

			await browser.click(By.id('add_select'))

			const selectTag = await browser.findElement(By.id('languages'))
			const selectTagIsVisible = await selectTag.isDisplayed()
			expect(selectTagIsVisible).toBe(false)
		})
	})

	describe('send key combination', () => {
		test('can send combination keys', async () => {
			const setting: any = normalizeSettings(DEFAULT_SETTINGS)
			const browser = new Browser(workRoot, puppeteer, setting)
			const url = await serve('combination_keys.html')
			await browser.visit(url)
			const input = await browser.findElement(By.id('text'))
			await input.focus()
			// use combination key as document
			await browser.sendKeys('a')
			await browser.sendKeyCombinations(Key.SHIFT, 'KeyA')
			let text = await input.getProperty('value')
			expect(text).toBe('aA')

			await input.clear()
			// use combination key by normal way with lower case
			await browser.sendKeys('a')
			await browser.sendKeyCombinations(Key.SHIFT, 'a')
			text = await input.getProperty('value')
			expect(text).toBe('aA')

			await input.clear()
			// use combination key by normal way with upper case
			await browser.sendKeys('a')
			await browser.sendKeyCombinations(Key.SHIFT, 'A')
			text = await input.getProperty('value')
			expect(text).toBe('aA')
		})
	})

	test('multiple pages handling', async () => {
		const setting: any = normalizeSettings(DEFAULT_SETTINGS)
		const browser = new Browser(workRoot, puppeteer, setting)
		const url = await serve('page_1.html')

		await browser.visit(url)
		await browser.click(By.tagName('a'))
		const newPage = await browser.waitForNewPage()
		expect(newPage.url()).toContain('/page_2.html')

		const pages = await browser.pages

		// 3 tabs - about:blank, page_1.html & page_2.html
		expect(pages.length).toEqual(3)

		// switch page using page index in browser.pages
		await browser.switchTo().page(1)
		expect(browser.url).toContain('/page_1.html')

		// switch page using the page itself
		await browser.switchTo().page(newPage)
		expect(browser.url).toContain('/page_2.html')
	})

	describe('scrollTo and scrollBy', () => {
		let browser: Browser<any>
		beforeEach(async () => {
			const settings: any = normalizeSettings(DEFAULT_SETTINGS)
			browser = new Browser(workRoot, puppeteer, settings)
			const url = 'https://testscroll.hongla.dev'

			await browser.visit(url)
		})
		test('scrollTo', async () => {
			const docScrollHeight: number = await browser.evaluate(() =>
				Math.max(
					document.body.scrollHeight,
					document.documentElement.scrollHeight,
					document.body.offsetHeight,
					document.documentElement.offsetHeight,
					document.body.clientHeight,
					document.documentElement.clientHeight,
				),
			)
			const docScrollWidth: number = await browser.evaluate(() =>
				Math.max(
					document.body.scrollWidth,
					document.documentElement.scrollWidth,
					document.body.offsetWidth,
					document.documentElement.offsetWidth,
					document.body.clientWidth,
					document.documentElement.clientWidth,
				),
			)
			const docClientHeight: number = await browser.evaluate(
				() => document.documentElement.clientHeight,
			)
			const docClienWidth: number = await browser.evaluate(
				() => document.documentElement.clientWidth,
			)

			await browser.scrollTo('bottom', { behavior: 'smooth' })
			await browser.wait(2)
			const currentPosAfterScrollBot = await getCurrentPosition(browser)
			expect(docScrollHeight - docClientHeight).toBe(currentPosAfterScrollBot.top)

			await browser.scrollTo('right')
			const currentPosAfterScrollRight = await getCurrentPosition(browser)
			expect(docScrollWidth - docClienWidth).toBe(currentPosAfterScrollRight.left)

			await browser.scrollTo('left')
			const currentPosAfterScrollLeft = await getCurrentPosition(browser)
			expect(currentPosAfterScrollLeft.left).toBe(0)

			await browser.scrollTo('top')
			const currentPosAfterScrollTop = await getCurrentPosition(browser)
			expect(currentPosAfterScrollTop.top).toBe(0)

			await browser.scrollTo([1000, 500])
			await browser.wait(1)
			const currentPosAfterScrollToPoint = await getCurrentPosition(browser)
			expect(currentPosAfterScrollToPoint).toStrictEqual({ top: 500, left: 1000 })

			const btn = By.css('.btn')
			await browser.scrollTo(btn, { behavior: 'smooth', block: 'center', inline: 'start' })
			await browser.wait(2)
			const btnEl = await browser.findElement(btn)
			const btnLocation = await btnEl.location()
			const btnOffsetHeight = (await btnEl.element.boundingBox()).height
			expect((docClientHeight - btnOffsetHeight) / 2).toBe(btnLocation.y)
			expect(btnLocation.x).toBe(0)

			const paragraph = await browser.findElement(By.css('p'))
			await browser.scrollTo(paragraph, { behavior: 'smooth', block: 'start' })
			await browser.wait(2)
			const paragraphLocation = await paragraph.location()
			expect(paragraphLocation.y).toBe(0)
		})

		// test('scrollBy', async () => {})
	})
})
