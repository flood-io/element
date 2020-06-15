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

	beforeEach(async () => {
		const url = await serve('definition_lists.html')
		await page.goto(url)
	})

	describe('ElementTextCondition', () => {
		test('waits Until.elementTextIs', async () => {
			const condition = Until.elementTextIs(By.css('#name'), 'changed!')
			await page.click('#name')
			const found = await condition.waitFor(page.mainFrame())
			expect(found).toBe(true)
		})

		test('waits Until.elementTextMatches', async () => {
			const condition = Until.elementTextMatches(By.css('#name'), /changed/)
			await page.click('#name')
			const found = await condition.waitFor(page.mainFrame())
			expect(found).toBe(true)
		})

		test('waits Until.elementTextContains', async () => {
			const condition = Until.elementTextContains(By.css('#name'), 'changed')
			await page.click('#name')
			const found = await condition.waitFor(page.mainFrame())
			expect(found).toBe(true)
		})
	})
})
