import { DogfoodServer } from '../../../tests/support/fixture-server'
import { launchPuppeteer, testPuppeteer } from '../../../tests/support/launch-browser'
import { Page } from 'puppeteer'
import { Until } from '../Until'

let dogfoodServer = new DogfoodServer()

let page: Page, puppeteer: testPuppeteer

describe('Condition', () => {
	jest.setTimeout(30e3)
	describe('URLCondition', () => {
		beforeAll(async () => {
			await dogfoodServer.start()

			puppeteer = await launchPuppeteer()

			page = puppeteer.page
		})

		afterAll(async () => {
			await dogfoodServer.close()
			await puppeteer.close()
		})

		beforeEach(async () => {
			await page.goto('http://localhost:1337/timeout_window_location.html')
		})

		test('waits Until.urlIs', async () => {
			let condition = Until.urlIs('http://localhost:1337/non_control_elements.html')
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
