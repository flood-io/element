import { serve } from '../../tests/support/fixture-server'
import { testWorkRoot } from '../../tests/support/test-run-env'
import { launchPlaywright, testPlaywright } from '../../tests/support/launch-browser'
import { Browser } from './Browser'
import { Until } from '../page/Until'
import { By } from '../page/By'
import { Key } from '../page/Enums'
import { DEFAULT_SETTINGS } from './Settings'

let playwright: testPlaywright
const workRoot = testWorkRoot()

const getCurrentPosition = async (
	browser: Browser<any>
): Promise<{ top: number; left: number }> => {
	return await browser.evaluate(() => ({
		top: document.documentElement.scrollTop || document.body.scrollTop,
		left: document.documentElement.scrollLeft || document.body.scrollLeft,
	}))
}

describe('Browser', () => {
	jest.setTimeout(30e3)
	beforeAll(async () => {
		playwright = await launchPlaywright()

		playwright.page.on('console', (msg) =>
			console.log(`>> remote console.${msg.type()}: ${msg.text()}`)
		)
	})

	afterAll(async () => {
		await playwright.close()
	})

	test('fires callbacks on action command calls', async () => {
		const beforeSpy = jest.fn()
		const afterSpy = jest.fn()

		const browser = new Browser(
			workRoot,
			playwright,
			DEFAULT_SETTINGS,
			async (_browser, actionName) => {
				beforeSpy(actionName)
			},
			async (_browser, actionName) => {
				afterSpy(actionName)
			}
		)
		const url = await serve('forms_with_input_elements.html')
		await browser.visit(url)

		expect(beforeSpy).toHaveBeenCalledWith('visit')
		expect(afterSpy).toHaveBeenCalledWith('visit')
	})

	test('throws an error', async () => {
		const browser = new Browser(
			workRoot,
			playwright,
			{ ...DEFAULT_SETTINGS },
			async (name) => {},
			async (name) => {}
		)
		const url = await serve('forms_with_input_elements.html')
		await browser.visit(url)

		return expect(browser.click('.notanelement')).rejects.toEqual(
			new Error(`No element was found on the page using '.notanelement'`)
		)
	})

	test('returns active element', async () => {
		const browser = new Browser(workRoot, playwright, DEFAULT_SETTINGS)

		const url = await serve('forms_with_input_elements.html')

		await browser.visit(url)
		await browser.wait(Until.elementIsVisible(By.id('new_user_first_name')))

		const el1 = await browser.switchTo().activeElement()
		expect(el1).toBeDefined()
		expect(el1).not.toBeNull()
		expect(await el1?.getId()).toBe('new_user_first_name')
	})

	describe('Frame handling', () => {
		let browser: Browser<any>

		beforeEach(async () => {
			browser = new Browser(workRoot, playwright, DEFAULT_SETTINGS)
			const url = await serve('frames.html')
			await browser.visit(url)
		})

		test('can list all frames', async () => {
			const frames = browser.frames
			expect(frames).toHaveLength(3)
			expect(frames.map((f) => f.name())).toEqual(['', 'frame1', 'frame2'])
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
			const browser = new Browser(workRoot, playwright, DEFAULT_SETTINGS)
			await browser.visit('https://www.google.com')

			const result = await browser.interactionTiming()
			expect(result).toBeGreaterThan(10)
		})
	})

	describe('auto waiting', () => {
		test('automatically applies a wait step to actions', async () => {
			const browser = new Browser(workRoot, playwright, {
				...DEFAULT_SETTINGS,
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
			const browser = new Browser(workRoot, playwright, DEFAULT_SETTINGS)
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
			const browser = new Browser(workRoot, playwright, DEFAULT_SETTINGS)
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
		const browser = new Browser(workRoot, playwright, DEFAULT_SETTINGS)
		const url = await serve('page_1.html')

		await browser.visit(url)
		await browser.click(By.tagName('a'))
		const newPage = await browser.waitForNewPage()
		expect(newPage.url()).toContain('/page_2.html')

		const pages = await browser.pages
		expect(pages.length).toEqual(2)

		await browser.switchTo().page(0)
		expect(browser.url).toContain('/page_1.html')

		await browser.switchTo().page(newPage)
		expect(browser.url).toContain('/page_2.html')
	})

	test('action getCookies()', async () => {
		const browser = new Browser(workRoot, playwright, DEFAULT_SETTINGS)
		const url = await serve('test-cookies.html')

		await browser.visit(url, { waitUntil: 'load' })
		const getCookiesByStringName = await browser.getCookies({ names: 'element-cookie' })

		expect(getCookiesByStringName.length).toStrictEqual(1)
		expect(getCookiesByStringName[0].name).toStrictEqual('element-cookie')

		const getCookiesByStringArray = await browser.getCookies({
			names: ['element-cookie', 'floodio'],
		})

		expect(getCookiesByStringArray.length).toStrictEqual(2)
		expect(getCookiesByStringArray[0].name).toStrictEqual('element-cookie')
		expect(getCookiesByStringArray[1].name).toStrictEqual('floodio')
	})

	test('action getUrl()', async () => {
		const browser = new Browser(workRoot, playwright, DEFAULT_SETTINGS)
		const URL = 'https://challenge.flood.io/'
		await browser.visit(URL, { waitUntil: 'load' })

		const currentUrl = browser.getUrl()
		expect(currentUrl).toStrictEqual(URL)
	})

	describe('scrollTo and scrollBy', () => {
		let browser: Browser<any>
		let docScrollHeight: number,
			docScrollWidth: number,
			docClientHeight: number,
			docClientWidth: number
		beforeEach(async () => {
			browser = new Browser(workRoot, playwright, DEFAULT_SETTINGS)
			const url = await serve('scroll.html')

			await browser.visit(url)
			docScrollHeight = await browser.evaluate(() =>
				Math.max(
					document.body.scrollHeight,
					document.documentElement.scrollHeight,
					document.body.offsetHeight,
					document.documentElement.offsetHeight,
					document.body.clientHeight,
					document.documentElement.clientHeight
				)
			)

			docScrollWidth = await browser.evaluate(() =>
				Math.max(
					document.body.scrollWidth,
					document.documentElement.scrollWidth,
					document.body.offsetWidth,
					document.documentElement.offsetWidth,
					document.body.clientWidth,
					document.documentElement.clientWidth
				)
			)

			docClientHeight = await browser.evaluate(() => document.documentElement.clientHeight)
			docClientWidth = await browser.evaluate(() => document.documentElement.clientWidth)
		})

		afterEach(async () => {
			await browser.scrollTo('top')
		})
		test('scrollTo', async () => {
			await browser.scrollTo('bottom', { behavior: 'smooth' })
			await browser.wait(2)
			const currentPosAfterScrollBot = await getCurrentPosition(browser)
			expect(docScrollHeight - docClientHeight).toBe(currentPosAfterScrollBot.top)

			await browser.scrollTo('right')
			const currentPosAfterScrollRight = await getCurrentPosition(browser)
			expect(docScrollWidth - docClientWidth).toBe(currentPosAfterScrollRight.left)

			await browser.scrollTo('left')
			const currentPosAfterScrollLeft = await getCurrentPosition(browser)
			expect(currentPosAfterScrollLeft.left).toBe(0)

			await browser.scrollTo('top')
			const currentPosAfterScrollTop = await getCurrentPosition(browser)
			expect(currentPosAfterScrollTop.top).toBe(0)

			await browser.scrollTo([1000, 500])
			const currentPosAfterScrollToPoint = await getCurrentPosition(browser)
			expect(currentPosAfterScrollToPoint).toStrictEqual({ top: 500, left: 1000 })

			const btn = By.css('.btn')
			await browser.scrollTo(btn, { block: 'center', inline: 'start' })
			const btnEl = await browser.findElement(btn)
			const btnLocation = await btnEl.location()
			const btnHeight = (await btnEl?.element.boundingBox())!.height
			expect(Math.round((docClientHeight - btnHeight) / 2)).toBe(btnLocation.y)
			expect(btnLocation.x).toBe(0)

			const paragraph = await browser.findElement(By.css('p'))
			await browser.scrollTo(paragraph, { block: 'start' })
			const paragraphLocation = await paragraph.location()
			expect(paragraphLocation.y).toBe(0)
		})

		test('scrollBy', async () => {
			const beforeScrollBy = await getCurrentPosition(browser)
			await browser.scrollBy(700, 400)
			const currentPosAfterScrollBy = await getCurrentPosition(browser)
			expect(currentPosAfterScrollBy).toStrictEqual({
				top: beforeScrollBy.top + 400,
				left: beforeScrollBy.left + 700,
			})

			await browser.scrollBy(-700, -400)
			const currentPosAfterScrollByAgain = await getCurrentPosition(browser)
			expect(currentPosAfterScrollByAgain).toStrictEqual({
				top: currentPosAfterScrollBy.top - 400,
				left: currentPosAfterScrollBy.left - 700,
			})

			await browser.scrollTo('top')
			const currentPosAfterScrollTop = await getCurrentPosition(browser)

			await browser.scrollBy(0, 'window.innerHeight')
			const currentPosAfterScrollInnerHeight = await getCurrentPosition(browser)
			expect(currentPosAfterScrollInnerHeight).toStrictEqual({
				top: currentPosAfterScrollTop.top + docClientHeight,
				left: currentPosAfterScrollTop.left,
			})

			await browser.scrollBy('window.innerWidth', 0)
			const currentPosAfterScrollInnerWidth = await getCurrentPosition(browser)
			expect(currentPosAfterScrollInnerWidth).toStrictEqual({
				top: currentPosAfterScrollInnerHeight.top,
				left: currentPosAfterScrollInnerHeight.left + docClientWidth,
			})
		})
	})

	test('drag an element into another element', async () => {
		const browser = new Browser(workRoot, playwright, DEFAULT_SETTINGS)
		const url = await serve('html_drag_drop.html')

		await browser.visit(url)
		const from = await browser.findElement(By.id('#draggable'))
		const to = await browser.findElement(By.id('#droppable'))

		await browser.drag(from, to)
		const resultText = await to.text()
		expect(resultText).toBe('Dropped!')
	})
})
