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

	beforeEach(async () => {
		await page.goto('http://localhost:1337/definition_lists.html')
	})

	describe('ElementTextCondition', () => {
		test('waits Until.elementTextIs', async () => {
			let condition = Until.elementTextIs(By.css('#name'), 'changed!')
			page.click('#name')
			let found = await condition.waitFor(page.mainFrame())
			expect(found).toBe(true)
		}, 5e3)

		test('waits Until.elementTextMatches', async () => {
			let condition = Until.elementTextMatches(By.css('#name'), /changed/)
			page.click('#name')
			let found = await condition.waitFor(page.mainFrame())
			expect(found).toBe(true)
		}, 5e3)

		test('waits Until.elementTextContains', async () => {
			let condition = Until.elementTextContains(By.css('#name'), 'changed')
			page.click('#name')
			let found = await condition.waitFor(page.mainFrame())
			expect(found).toBe(true)
		}, 5e3)
	})
})
