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
		await page.goto('http://localhost:1337/forms_with_input_elements.html', {
			waitUntil: 'networkidle2',
		})
	})

	describe('ElementSelectedCondition', () => {
		it('waits Until.elementIsSelected', async () => {
			// Wait until Sweden is selected
			let condition = Until.elementIsSelected(By.css('select#new_user_country option[value="3"]'))
			page.select('select#new_user_country', '3')
			let found = await condition.waitFor(page.mainFrame(), undefined)
			expect(found).to.equal(true)
		}).timeout(31e3)

		it('waits Until.elementIsNotSelected', async () => {
			let condition = Until.elementIsNotSelected(
				By.css('select#new_user_country option[value="2"]'),
			)
			page.select('select#new_user_country', '3')
			let found = await condition.waitFor(page.mainFrame(), undefined)
			expect(found).to.equal(true)
		}).timeout(31e3)
	})
})
