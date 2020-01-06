import { serve } from '../../../tests/support/fixture-server'
import { launchPuppeteer, testPuppeteer } from '../../../tests/support/launch-browser'
import { Page } from 'puppeteer'
import { Until } from '../Until'
import { URL } from 'url'
let page: Page, puppeteer: testPuppeteer

describe('Condition', () => {
	jest.setTimeout(30e3)
	describe('URLCondition', () => {
		beforeAll(async () => {
			puppeteer = await launchPuppeteer()
			page = puppeteer.page
		})

		afterAll(async () => {
			await puppeteer.close()
		})

		let url

		beforeEach(async () => {
			url = await serve('timeout_window_location.html')
			await page.goto(url)
		})

		test('waits Until.urlIs', async () => {
			let uri = new URL(url)
			uri.pathname = 'non_control_elements.html'

			let condition = Until.urlIs(uri.toString())
			let result = await condition.waitFor(page.mainFrame())
			expect(result).toBe(true)
		})

		test('waits Until.urlMatches', async () => {
			let condition = Until.urlMatches(/non_control_elements/)
			let result = await condition.waitFor(page.mainFrame())
			expect(result).toBe(true)
		})

		test('waits Until.urlContains', async () => {
			let condition = Until.urlContains('non_control_elements')
			let result = await condition.waitFor(page.mainFrame())
			expect(result).toBe(true)
		})
	})
})
