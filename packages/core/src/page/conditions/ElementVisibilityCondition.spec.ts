import { serve } from '../../../tests/support/fixture-server'
import { launchPuppeteer, testPuppeteer } from '../../../tests/support/launch-browser'
import { Page } from 'puppeteer'
import { Until } from '../Until'
import { By } from '../By'

let page: Page, puppeteer: testPuppeteer

describe('Condition', () => {
	jest.setTimeout(30e3)
	beforeAll(async () => {
		puppeteer = await launchPuppeteer()
		page = puppeteer.page
		page.on('console', msg => console.log(`>> console.${msg.type()}: ${msg.text()}`))
	})

	afterAll(async () => {
		await puppeteer.close()
	})

	describe('ElementVisibilityCondition', () => {
		beforeEach(async () => {
			let url = await serve('wait.html')
			await page.goto(url)
		})
		test('waits Until.elementIsVisible', async () => {
			let condition = Until.elementIsVisible(By.css('#bar'))

			// Triggers a timeout of 500ms
			await page.click('a#show_bar')

			let found = await condition.waitFor(page.mainFrame())
			expect(found).toBe(true)
		}, 31e3)

		test('waits Until.elementIsNotVisible', async () => {
			let condition = Until.elementIsNotVisible(By.css('#foo'))

			// Triggers a timeout of 500ms
			await page.click('a#hide_foo')

			let found = await condition.waitFor(page.mainFrame())
			expect(found).toBe(true)
		}, 31e3)
	})

	describe('ElementLocatedCondition', () => {
		beforeEach(async () => {
			let url = await serve('timeout_window_location.html')
			await page.goto(url)
		})

		test('waits Until.elementLocated', async () => {
			let condition = Until.elementLocated(By.css('h1#first_header'))
			let found = await condition.waitFor(page.mainFrame())
			expect(found).toBe(true)
		}, 31e3)

		test('waits Until.elementsLocated', async () => {
			let condition = Until.elementsLocated(By.partialLinkText('Link'), 2)
			let found = await condition.waitFor(page.mainFrame())
			expect(found).toBe(true)
		}, 31e3)
	})
})
