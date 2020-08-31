import { serve } from '../../../tests/support/fixture-server'
import { launchPuppeteer, testPuppeteer } from '../../../tests/support/launch-browser'
import { Page } from 'puppeteer'
import { Until } from '../Until'
import { URL } from 'url'
let page: Page, puppeteer: testPuppeteer

describe('Condition', () => {
	jest.setTimeout(10e3)
	describe('URLCondition', () => {
		beforeAll(async () => {
			puppeteer = await launchPuppeteer()
			page = puppeteer.page
		})

		afterAll(async () => {
			await puppeteer.close()
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
