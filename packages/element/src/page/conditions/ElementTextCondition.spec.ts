import { expect } from 'chai'
import 'mocha'
import { DogfoodServer } from '../../../tests/support/fixture-server'
import { launchPuppeteer, testPuppeteer } from '../../../tests/support/launch-browser'
import { Page } from 'puppeteer'
import { Until } from '../Until'
import { By } from '../By'

let dogfoodServer = new DogfoodServer()

let page: Page, puppeteer: testPuppeteer

describe('Condition', function() {
	this.timeout(30e3)
	before(async () => {
		await dogfoodServer.start()
		puppeteer = await launchPuppeteer()
		page = puppeteer.page
		page.on('console', msg => console.log(`>> console.${msg.type()}: ${msg.text()}`))
	})

	after(async () => {
		await dogfoodServer.close()
		await puppeteer.close()
	})

	beforeEach(async () => {
		await page.goto('http://localhost:1337/definition_lists.html')
	})

	describe('ElementTextCondition', () => {
		it('waits Until.elementTextIs', async () => {
			let condition = Until.elementTextIs(By.css('#name'), 'changed!')
			page.click('#name')
			let found = await condition.waitFor(page.mainFrame())
			expect(found).to.equal(true)
		}).timeout(5e3)

		it('waits Until.elementTextMatches', async () => {
			let condition = Until.elementTextMatches(By.css('#name'), /changed/)
			page.click('#name')
			let found = await condition.waitFor(page.mainFrame())
			expect(found).to.equal(true)
		}).timeout(5e3)

		it('waits Until.elementTextContains', async () => {
			let condition = Until.elementTextContains(By.css('#name'), 'changed')
			page.click('#name')
			let found = await condition.waitFor(page.mainFrame())
			expect(found).to.equal(true)
		}).timeout(5e3)
	})
})
