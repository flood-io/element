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

	beforeEach(async () => {
		let url = await serve('definition_lists.html')
		await page.goto(url)
	})

	describe('ElementTextCondition', () => {
		test('waits Until.elementTextIs', async () => {
			let condition = Until.elementTextIs(By.css('#name'), 'changed!')
			page.click('#name')
			let found = await condition.waitFor(page.mainFrame())
			expect(found).toBe(true)
		})

		test('waits Until.elementTextMatches', async () => {
			let condition = Until.elementTextMatches(By.css('#name'), /changed/)
			page.click('#name')
			let found = await condition.waitFor(page.mainFrame())
			expect(found).toBe(true)
		})

		test('waits Until.elementTextContains', async () => {
			let condition = Until.elementTextContains(By.css('#name'), 'changed')
			page.click('#name')
			let found = await condition.waitFor(page.mainFrame())
			expect(found).toBe(true)
		})
	})
})
