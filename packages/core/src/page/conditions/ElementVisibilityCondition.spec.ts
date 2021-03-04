import { serve } from '../../../tests/support/fixture-server'
import { launchPlaywright, testPlaywright } from '../../../tests/support/launch-browser'
import { Page } from 'playwright'
import { Until } from '../Until'
import { By } from '../By'

let page: Page, playwright: testPlaywright

describe('Condition', () => {
	jest.setTimeout(30e3)
	beforeAll(async () => {
		playwright = await launchPlaywright()
		page = playwright.page
		page.on('console', msg => console.log(`>> console.${msg.type()}: ${msg.text()}`))
	})

	afterAll(async () => {
		await playwright.close()
	})

	describe('ElementVisibilityCondition', () => {
		beforeEach(async () => {
			const url = await serve('wait.html')
			await page.goto(url)
		})
		test('waits Until.elementIsVisible', async () => {
			const condition = Until.elementIsVisible(By.css('#bar'))

			// Triggers a timeout of 500ms
			await page.click('a#show_bar')

			const found = await condition.waitFor(page.mainFrame())
			expect(found).toBe(true)
		}, 31e3)

		test('waits Until.elementIsNotVisible', async () => {
			const condition = Until.elementIsNotVisible(By.css('#foo'))

			// Triggers a timeout of 500ms
			await page.click('a#hide_foo')

			const found = await condition.waitFor(page.mainFrame())
			expect(found).toBe(true)
		}, 31e3)
	})

	describe('ElementLocatedCondition', () => {
		beforeEach(async () => {
			const url = await serve('timeout_window_location.html')
			await page.goto(url)
		})

		test('waits Until.elementLocated', async () => {
			const condition = Until.elementLocated(By.css('h1#first_header'))
			const found = await condition.waitFor(page.mainFrame())
			expect(found).toBe(true)
		}, 31e3)

		test('waits Until.elementsLocated', async () => {
			const condition = Until.elementsLocated(By.partialLinkText('Link'), 2)
			const found = await condition.waitFor(page.mainFrame())
			expect(found).toBe(true)
		}, 31e3)
	})
})
