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

		test('waits Until.titleIsNot', async () => {
			let condition = Until.titleIsNot('wait test')

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

		test('waits Until.titleDoesNotContain', async () => {
			let condition = Until.titleDoesNotContain('wait test')

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

		test('waits Until.titleMatches regex starts with', async () => {
			let condition = Until.titleDoesNotMatch(/^wait/)

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

		test('waits Until.titleMatches regex ends with', async () => {
			let condition = Until.titleDoesNotMatch(/test$/)

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

		test('waits Until.titleMatches regex full match', async () => {
			let condition = Until.titleDoesNotMatch(/^wait test$/)

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
