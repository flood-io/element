import { expect } from 'chai'
import 'mocha'
import { DogfoodServer } from '../../../tests/support/fixture-server'
import PuppeteerDriver from '../../driver/Puppeteer'
import { Page } from 'puppeteer'
import { Until } from '../Until'
import { By } from '../By'

let dogfoodServer = new DogfoodServer()

let page: Page, driver: PuppeteerDriver, puppeteer

describe('Condition', function() {
	this.timeout(30e3)
	before(async () => {
		await dogfoodServer.start()
	})

	after(async () => {
		await dogfoodServer.close()
		await driver.close()
	})

	beforeEach(async () => {
		driver = new PuppeteerDriver()
		await driver.launch()
		puppeteer = await driver.client()
		page = puppeteer.page
		page.on('console', msg => console.log(`>> console.${msg.type}: ${msg.text}`))
		await page.goto('http://localhost:1337/wait.html', { waitUntil: 'networkidle2' })
	})

	afterEach(async () => {
		await driver.close()
	})

	describe('ElementStateCondition', () => {
		it('waits Until.elementIsEnabled', async () => {
			let condition = Until.elementIsEnabled(By.css('#btn'))

			// Triggers a timeout of 500ms
			await page.click('a#enable_btn')

			let found = await condition.waitFor(page.mainFrame())
			expect(found).to.equal(true)
		}).timeout(31e3)

		it('waits Until.elementIsDisabled', async () => {
			await page.evaluate(() => document.querySelector('#btn').removeAttribute('disabled'))
			let btn = await page.$('#btn')

			expect(btn).to.not.be.null

			expect(
				await btn.executionContext().evaluate(el => el.hasAttribute('disabled'), btn),
			).to.equal(false)

			let condition = Until.elementIsDisabled(By.css('#btn'))

			await page.click('#btn')

			let found = await condition.waitFor(page.mainFrame())
			expect(found).to.equal(true)
		}).timeout(31e3)
	})
})
