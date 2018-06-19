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
	describe('URLCondition', () => {
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
			await page.goto('http://localhost:1337/timeout_window_location.html')
		})

		it('waits Until.urlIs', async () => {
			let condition = Until.urlIs('http://localhost:1337/non_control_elements.html')
			let result = await condition.waitFor(page.mainFrame())
			expect(result).to.equal(true)
		})

		it('waits Until.urlMatches', async () => {
			let condition = Until.urlMatches(/non_control_elements/)
			let result = await condition.waitFor(page.mainFrame())
			expect(result).to.equal(true)
		})

		it('waits Until.urlContains', async () => {
			let condition = Until.urlContains('non_control_elements')
			let result = await condition.waitFor(page.mainFrame())
			expect(result).to.equal(true)
		})
	})
})
