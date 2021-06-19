import { serve } from '../../tests/support/fixture-server'
import { launchPlaywright, testPlaywright } from '../../tests/support/launch-browser'
import { Page } from 'playwright'
import { Locator, ElementHandle } from './types'
import { By } from './By'

let page: Page
let playwright: testPlaywright

function ensureElement(value: ElementHandle | undefined | null): ElementHandle | never {
	if (value !== null && value !== undefined) {
		return value
	} else {
		throw new Error("value isn't an element")
	}
}

async function findEl(locator: Locator): Promise<ElementHandle> {
	return ensureElement(await locator.find(page))
}

describe('Locator', () => {
	jest.setTimeout(30e3)

	beforeAll(async () => {
		playwright = await launchPlaywright()
		page = playwright.page
		page.on('console', (msg) => console.log(`>> console.${msg.type()}: ${msg.text()}`))
	})

	afterAll(async () => {
		await playwright.close()
	})

	beforeEach(async () => {
		const url = await serve('wait.html')
		await page.goto(url)
	})

	describe('By.linkText', () => {
		test('find()', async () => {
			const locator = By.linkText('show bar')

			const element = await findEl(locator)
			expect(await element.getAttribute('id')).toEqual('show_bar')
			await element.dispose()
		})

		test('findMany()', async () => {
			const locator = By.linkText('show bar')

			const elements = await locator.findMany(await page)
			expect(elements.length).toBe(1)

			expect(await elements[0].getAttribute('id')).toEqual('show_bar')
			await elements[0].dispose()
		})
	})
	describe('By.partialLinkText', () => {
		test('find()', async () => {
			const locator = By.linkText('show bar')

			const element = await findEl(locator)
			expect(await element.getAttribute('id')).toEqual('show_bar')
			await element.dispose()
		})

		test('findMany()', async () => {
			const locator = By.linkText('show bar')

			const elements = await locator.findMany(page)
			expect(elements.length).toBe(1)

			expect(await elements[0].getAttribute('id')).toEqual('show_bar')
			await elements[0].dispose()
		})
	})

	describe('By.css', () => {
		test('find()', async () => {
			const locator = By.css('a:first-child')

			const element = await findEl(locator)
			expect(await element.getAttribute('id')).toEqual('change_select')
			await element.dispose()
		})

		test('findMany()', async () => {
			const locator = By.css('a:first-child')

			const elements = await locator.findMany(page)
			expect(elements.length).toBe(1)

			expect(await elements[0].getAttribute('id')).toEqual('change_select')
			await elements[0].dispose()
		})
	})

	describe('By.visibleText', () => {
		test('find()', async () => {
			const locator = By.visibleText('show bar')
			const element = await findEl(locator)
			expect(element).not.toBeNull()
			expect(await element.getAttribute('id')).toEqual('show_bar')
			expect(await element.text()).toEqual('show bar')
			await element.dispose()
		})

		test('findMany()', async () => {
			const locator = By.visibleText('show bar')

			const elements = await locator.findMany(page)
			expect(elements.length).toBe(1)

			expect(await elements[0].getAttribute('id')).toEqual('show_bar')
			await elements[0].dispose()
		})
	})

	describe('By.partialVisibleText', () => {
		test('find()', async () => {
			const locator = By.partialVisibleText('change select list')

			const element = await findEl(locator)
			expect(element).not.toBeNull()
			await element.dispose()
		})

		test('findMany()', async () => {
			const locator = By.partialVisibleText('change select list')

			const elements = await locator.findMany(page)
			expect(elements.length).toBe(4)

			for (const element of elements) {
				await element.dispose()
			}
		})
	})

	describe('By.js', () => {
		test('find()', async () => {
			const locator = By.js(() => document.querySelector('a[href]'))

			const element = await findEl(locator)
			expect(element).not.toBeNull()
			expect(await element.getId()).toBe('show_bar')
			await element.dispose()
		})

		test('findMany()', async () => {
			const locator = By.js(() => document.querySelectorAll('a[href]'))

			const elements = await locator.findMany(page)
			expect(elements.length).toBe(8)

			for (const element of elements) {
				await element.dispose()
			}
		})
	})

	describe('By.nameAttr', () => {
		test('find()', async () => {
			const locator = By.nameAttr('add_select')

			const element = await findEl(locator)
			expect(element).not.toBeNull()
			expect(await element.getId()).toBe('add_select')
			await element.dispose()
		})

		test('findMany()', async () => {
			const locator = By.nameAttr('add_select')

			const elements = await locator.findMany(page)
			expect(elements.length).toBe(1)

			for (const element of elements) {
				await element.dispose()
			}
		})
	})

	describe('By.tagName', () => {
		test('find()', async () => {
			const locator = By.tagName('a')

			const element = await findEl(locator)
			expect(element).not.toBeNull()
			expect(await element.getId()).toBe('show_bar')
			await element.dispose()
		})

		test('findMany()', async () => {
			const locator = By.tagName('a')

			const elements = await locator.findMany(page)
			expect(elements.length).toBe(8)

			for (const element of elements) {
				await element.dispose()
			}
		})
	})

	describe('By.xpath', () => {
		test('find()', async () => {
			const locator = By.xpath('//a')

			const element = await findEl(locator)
			expect(element).not.toBeNull()
			expect(await element.getId()).toBe('show_bar')
			await element.dispose()
		})

		test('findMany()', async () => {
			const locator = By.xpath('//a')

			const elements = await locator.findMany(page)
			expect(elements.length).toBe(8)

			for (const element of elements) {
				await element.dispose()
			}
		})
	})
})
