import { expect } from 'chai'
import 'mocha'
import { DogfoodServer } from '../../../tests/support/fixture-server'
import PuppeteerDriver from '../../driver/Puppeteer'
import { Page } from 'puppeteer'
import { Until } from '../Until'

let dogfoodServer = new DogfoodServer()

let page: Page, driver: PuppeteerDriver, puppeteer

describe('Condition', function() {
	this.timeout(30e3)
	describe('TitleCondition', () => {
		before(async () => {
			await dogfoodServer.start()
			driver = new PuppeteerDriver()
			await driver.launch()
			puppeteer = await driver.client()
			page = puppeteer.page
		})

		after(async () => {
			await dogfoodServer.close()
			await driver.close()
		})

		beforeEach(async () => {
			await page.goto('http://localhost:1337/wait.html')
		})

		it('waits Until.titleIs', async () => {
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
			expect(result).to.equal(true)
		})

		it('waits Until.titleContains', async () => {
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
			expect(result).to.equal(true)
		})

		it('waits Until.titleMatches', async () => {
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
			expect(result).to.equal(true)
		})
	})
})
