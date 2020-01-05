import { DogfoodServer } from '../../../tests/support/fixture-server'
import { launchPuppeteer, testPuppeteer } from '../../../tests/support/launch-browser'
import { Page } from 'puppeteer'
import { Until } from '../Until'
import { By } from '../By'

let dogfoodServer = new DogfoodServer()

let page: Page, puppeteer: testPuppeteer

describe('Condition', () => {
	jest.setTimeout(30e3)
	beforeAll(async () => {
		await dogfoodServer.start()
		puppeteer = await launchPuppeteer()
		page = puppeteer.page
		page.on('console', msg => console.log(`>> console.${msg.type()}: ${msg.text()}`))
	})

	afterAll(async () => {
		await dogfoodServer.close()
		await puppeteer.close()
	})

	describe('ElementVisibilityCondition', () => {
		beforeEach(async () => {
			await page.goto('http://localhost:1337/wait.html')
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
			await page.goto('http://localhost:1337/timeout_window_location.html')
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
