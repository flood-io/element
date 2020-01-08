import { ElementHandle } from './ElementHandle'
import { serve } from '../../tests/support/fixture-server'
import { ElementHandle as PElementHandle } from 'puppeteer'
import { launchPuppeteer, testPuppeteer } from '../../tests/support/launch-browser'
import { Browser } from '../runtime/Browser'
import { DEFAULT_SETTINGS } from '../runtime/Settings'
import { testWorkRoot } from '../../tests/support/test-run-env'

let puppeteer: testPuppeteer

async function locateEl(selector: string): Promise<PElementHandle | never> {
	const maybeEl = await puppeteer.page.$(selector)
	if (maybeEl === null || maybeEl === undefined) {
		throw new Error(`unable to find element via selector ${selector}`)
	} else {
		return maybeEl
	}
}

describe('ElementHandle', () => {
	jest.setTimeout(30e3)
	beforeAll(async () => {
		puppeteer = await launchPuppeteer()
		puppeteer.page.setViewport({
			height: 600,
			width: 800,
			deviceScaleFactor: 1,
			hasTouch: false,
			isLandscape: true,
			isMobile: false,
		})
	})

	afterAll(async () => {
		await puppeteer.close()
	})

	beforeEach(async () => {
		const url = await serve('wait.html')
		await puppeteer.page.goto(url, { waitUntil: 'domcontentloaded' })
	})

	test('getAttribute(id)', async () => {
		const handle = await locateEl('a#show_bar')
		const element = await new ElementHandle(handle)
		expect(await element.getAttribute('id')).toEqual('show_bar')
		await handle.dispose()
	})

	test('getAttribute(href)', async () => {
		const handle = await locateEl('a#show_bar')
		const element = await new ElementHandle(handle)
		expect(await element.getAttribute('href')).toEqual('#')
		await handle.dispose()
	})

	test('tagName()', async () => {
		const handle = await locateEl('a#show_bar')
		const element = await new ElementHandle(handle)
		expect(await element.tagName()).toBe('A')
		await handle.dispose()
	})

	test('getId()', async () => {
		const handle = await locateEl('a#show_bar')
		const element = await new ElementHandle(handle)
		expect(await element.getId()).toBe('show_bar')
		await handle.dispose()
	})

	test('isSelected()', async () => {
		const handle = await locateEl('#languages option')
		const element = await new ElementHandle(handle)
		expect(await element.isSelected()).toBe(true)
		await handle.dispose()
	})

	test('isSelectable()', async () => {
		const handle = await locateEl('#languages option')
		const element = await new ElementHandle(handle)
		expect(await element.isSelectable()).toBe(true)
		await handle.dispose()
	})

	test('text()', async () => {
		const handle = await locateEl('a#show_bar')
		const element = await new ElementHandle(handle)
		expect(await element.text()).toBe('show bar')
		await handle.dispose()
	})

	test('size()', async () => {
		const handle = await locateEl('a#show_bar')
		const element = await new ElementHandle(handle)
		expect((await element.size()).width).toBeGreaterThanOrEqual(57)
		expect((await element.size()).width).toBeLessThanOrEqual(60)
		expect((await element.size()).height).toBeGreaterThanOrEqual(15)
		expect((await element.size()).height).toBeLessThanOrEqual(20)
		await handle.dispose()
	})

	test('location()', async () => {
		const handle = await locateEl('a#show_bar')
		const element = await new ElementHandle(handle)
		expect(await element.location()).toEqual({ x: 8, y: 26 })
		await handle.dispose()
	})

	test('centerPoint()', async () => {
		const handle = await locateEl('a#show_bar')
		const element = await new ElementHandle(handle)
		expect(await element.centerPoint()).toEqual([37, 35])
		await handle.dispose()
	})

	test('click()', async () => {
		const handle = await locateEl('a#show_bar')
		const element = await new ElementHandle(handle)
		await element.click()
		await handle.dispose()
	})

	test('clear() input', async () => {
		const url = await serve('forms_with_input_elements.html')
		await puppeteer.page.goto(url)
		const handle: PElementHandle = await locateEl('input[name="new_user_first_name"]')
		const element = await new ElementHandle(handle)

		await element.type('user@example.com')

		let value = await handle
			.executionContext()
			.evaluate((element: HTMLInputElement) => element.value, handle)
		expect(value).toBe('user@example.com')

		await element.clear()

		value = await handle
			.executionContext()
			.evaluate((element: HTMLInputElement) => element.value, handle)
		expect(value).toBe('')
		await handle.dispose()
	})

	test('clear() select', async () => {
		const handle: PElementHandle = await locateEl('select')
		const element = await new ElementHandle(handle)
		let value = await handle
			.executionContext()
			.evaluate((element: HTMLInputElement) => element.value, handle)
		expect(value).toBe('3')

		await element.clear()

		value = await handle
			.executionContext()
			.evaluate((element: HTMLInputElement) => element.value, handle)
		expect(value).toBe('')
		await handle.dispose()
	})

	test('isDisplayed()', async () => {
		const handle: PElementHandle = await locateEl('#bar')
		const element = await new ElementHandle(handle)

		expect(await element.isDisplayed()).toBe(false)

		await puppeteer.page.click('#show_bar')
		await puppeteer.page.waitForSelector('#bar', { visible: true, timeout: 5e3 })

		expect(await element.isDisplayed()).toBe(true)

		await handle.dispose()
	})

	test('isEnabled()', async () => {
		const handle: PElementHandle = await locateEl('#btn')
		const element = await new ElementHandle(handle)

		expect(await element.isEnabled()).toBe(false)

		await puppeteer.page.click('#enable_btn')
		await puppeteer.page.waitForFunction(
			(selector: string) => {
				const element = document.querySelector(selector) as HTMLButtonElement
				return !element.disabled
			},
			{ polling: 'mutation', timeout: 5e3 },
			'#btn',
		)

		expect(await element.isEnabled()).toBe(true)

		await handle.dispose()
	})

	test('findElement()', async () => {
		const url = await serve('forms_with_input_elements.html')
		await puppeteer.page.goto(url)
		const handle: PElementHandle = await locateEl('form')
		const element = new ElementHandle(handle)
		const element2 = await element.findElement('input[name="new_user_first_name"]')
		const element3 = await element.findElement('h2')

		expect(element2).not.toBeNull()
		expect(element3).toBeNull()

		if (element2 !== null) {
			expect(await element2.getId()).toBe('new_user_first_name')
		}
	})

	test('findElements()', async () => {
		const url = await serve('forms_with_input_elements.html')
		await puppeteer.page.goto(url)
		const handle: PElementHandle = await locateEl('form')
		const element = await new ElementHandle(handle)
		const elementsList1 = await element.findElements('input')
		const elementsList2 = await element.findElements('h2')
		expect(elementsList1.length).toBe(45)
		expect(elementsList2.length).toBe(0)

		const displayedElements = await Promise.all(
			elementsList1.map(e => e.isDisplayed()),
		).then(result => elementsList1.filter((element, index) => result[index]))

		expect(displayedElements.length).toBe(43)
	})

	describe('uploadFile', () => {
		let browser: Browser<any>
		beforeEach(async () => {
			browser = new Browser(testWorkRoot(), puppeteer, DEFAULT_SETTINGS)
			const url = await serve('forms_with_input_elements.html')
			await browser.visit(url)
		})

		afterEach(async () => {
			await puppeteer.close()
		})

		test('uploads a file to a file input', async () => {
			const handle: PElementHandle = await locateEl('#new_user_portrait')
			const element = await new ElementHandle(handle)
			element.bindBrowser(browser)

			expect(await element.getProperty('value')).toHaveLength(0)
			await element.uploadFile('picture.png')
			expect(await element.getProperty('value')).toBe('C:\\fakepath\\picture.png')
		})
	})
})
