import { serve } from '../../../tests/support/fixture-server'
import { launchPlaywright, testPlaywright } from '../../../tests/support/launch-browser'
import { Page } from 'playwright'
import { Until } from '../Until'
import { URL } from 'url'
let page: Page, playwright: testPlaywright

describe('Condition', () => {
	jest.setTimeout(10e3)
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

		test('waits Until.urlIsNot', async () => {
			const uri = new URL(url)
			uri.pathname = 'timeout_window_location.html'

			const condition = Until.urlIs(uri.toString())
			const result = await condition.waitFor(page.mainFrame())
			expect(result).toBe(true)
		})

		test('waits Until.urlDoesNotMatch', async () => {
			const condition = Until.urlMatches(/meout_window_locati/)
			const result = await condition.waitFor(page.mainFrame())
			expect(result).toBe(true)
		})

		test('waits Until.urlDoesNotMatch regex ends with', async () => {
			const condition = Until.urlMatches(/_window_location.html$/)
			const result = await condition.waitFor(page.mainFrame())
			expect(result).toBe(true)
		})

		test('waits Until.urlDoesNotContain', async () => {
			const condition = Until.urlContains('eout_window_locati')
			const result = await condition.waitFor(page.mainFrame())
			expect(result).toBe(true)
		})
	})
})
