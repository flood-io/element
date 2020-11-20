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
		const url = await serve('definition_lists.html')
		await page.goto(url)
	})

	describe('ElementTextNotMatchCondition', () => {
		test('waits Until.elementTextIsNot', async () => {
			const condition = Until.elementTextIsNot(By.css('#name'), 'Name')
			condition.settings.waitTimeout = 30e3
			page.click('#name')
			const found = await condition.waitFor(page.mainFrame())
			expect(found).toBe(true)
		})
		test('waits Until.elementTextDoesNotContain', async () => {
			const condition = Until.elementTextDoesNotContain(By.css('#name'), 'ame')
			condition.settings.waitTimeout = 30e3
			page.click('#name')
			const found = await condition.waitFor(page.mainFrame())
			expect(found).toBe(true)
		})

		test('waits Until.elementTextDoesNotMatch regex starts with', async () => {
			const condition = Until.elementTextDoesNotMatch(By.css('#name'), /^Na/)
			condition.settings.waitTimeout = 30e3
			page.click('#name')
			const found = await condition.waitFor(page.mainFrame())
			expect(found).toBe(true)
		})

		test('waits Until.elementTextDoesNotMatch regex ends with', async () => {
			const condition = Until.elementTextDoesNotMatch(By.css('#name'), /me$/)
			condition.settings.waitTimeout = 30e3
			page.click('#name')
			const found = await condition.waitFor(page.mainFrame())
			expect(found).toBe(true)
		})

		test('waits Until.elementTextDoesNotMatch regex full match', async () => {
			const condition = Until.elementTextDoesNotMatch(By.css('#name'), /^Name$/)
			condition.settings.waitTimeout = 30e3
			page.click('#name')
			const found = await condition.waitFor(page.mainFrame())
			expect(found).toBe(true)
		})

		test('waits Until.elementTextDoesNotMatch regex contains', async () => {
			const condition = Until.elementTextDoesNotMatch(By.css('#name'), /am/)
			condition.settings.waitTimeout = 30e3
			page.click('#name')
			const found = await condition.waitFor(page.mainFrame())
			expect(found).toBe(true)
		})
	})
})
