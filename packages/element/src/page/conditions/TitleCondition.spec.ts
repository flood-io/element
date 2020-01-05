import { serve } from '../../../tests/support/fixture-server'
import { launchPuppeteer, testPuppeteer } from '../../../tests/support/launch-browser'
import { Page } from 'puppeteer'
import { Until } from '../Until'

let page: Page, puppeteer: testPuppeteer

describe('Condition', () => {
	jest.setTimeout(30e3)
	describe('TitleCondition', () => {
		beforeAll(async () => {
			puppeteer = await launchPuppeteer()
			page = puppeteer.page
		})

		afterAll(async () => {
			await puppeteer.close()
		})

		beforeEach(async () => {
			let url = await serve('wait.html')
			await page.goto(url)
		})

		test('waits Until.titleIs', async () => {
			let condition = Until.titleIs('another title')

			await page.evaluate(() => {
				return new Promise(yeah => {
					setTimeout(() => {
						document.title = 'another title'
						yeah()
					}, 100)
				})
			})

			let result = await condition.waitFor(page.mainFrame())
			expect(result).toBe(true)
		})

		test('waits Until.titleContains', async () => {
			let condition = Until.titleContains('another title')

			await page.evaluate(() => {
				return new Promise(yeah => {
					setTimeout(() => {
						document.title = 'another title again'
						yeah()
					}, 100)
				})
			})

			let result = await condition.waitFor(page.mainFrame())
			expect(result).toBe(true)
		})

		test('waits Until.titleMatches', async () => {
			let condition = Until.titleMatches(/^another/)

			await page.evaluate(() => {
				return new Promise(yeah => {
					setTimeout(() => {
						document.title = 'another title again'
						yeah()
					}, 100)
				})
			})

			let result = await condition.waitFor(page.mainFrame())
			expect(result).toBe(true)
		})
	})
})
