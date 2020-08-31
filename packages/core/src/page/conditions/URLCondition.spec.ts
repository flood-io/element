import { serve } from '../../../tests/support/fixture-server'
import { launchPlaywright, testPlaywright } from '../../../tests/support/launch-browser'
import { Page } from 'playwright'
import { Until } from '../Until'
import { URL } from 'url'
let page: Page, playwright: testPlaywright

describe('Condition', () => {
	jest.setTimeout(30e3)
	describe('URLCondition', () => {
		beforeAll(async () => {
			playwright = await launchPlaywright()
			page = playwright.page
		})

		afterAll(async () => {
			await playwright.close()
		})

		let url: any

		beforeEach(async () => {
			url = await serve('timeout_window_location.html')
			await page.goto(url)
		})

		test('waits Until.urlIs', async () => {
			const uri = new URL(url)
			uri.pathname = 'non_control_elements.html'

			const condition = Until.urlIs(uri.toString())
			const result = await condition.waitFor(page.mainFrame())
			expect(result).toBe(true)
		})

		test('waits Until.urlMatches', async () => {
			const condition = Until.urlMatches(/non_control_elements/)
			const result = await condition.waitFor(page.mainFrame())
			expect(result).toBe(true)
		})

		test('waits Until.urlContains', async () => {
			const condition = Until.urlContains('non_control_elements')
			const result = await condition.waitFor(page.mainFrame())
			expect(result).toBe(true)
		})
	})
})
