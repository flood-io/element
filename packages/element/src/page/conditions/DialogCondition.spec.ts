import { expect } from 'chai'
import 'mocha'
import { DogfoodServer } from '../../../tests/support/fixture-server'
import { launchPuppeteer, testPuppeteer } from '../../../tests/support/launch-browser'
import { Page, Dialog } from 'puppeteer'
import { Until } from '../Until'

let dogfoodServer = new DogfoodServer()

let page: Page, puppeteer: testPuppeteer

describe('Condition', function() {
	this.timeout(30e3)
	describe('DialogCondition', () => {
		before(async () => {
			await dogfoodServer.start()
			puppeteer = await launchPuppeteer()
			page = puppeteer.page
		})

		after(async () => {
			await dogfoodServer.close()
			await puppeteer.close()
		})

		beforeEach(async () => {
			await page.goto('http://localhost:1337/alerts.html')
		})

		it('waits Until.alertIsPresent alert', async () => {
			let condition = Until.alertIsPresent()

			page.click('#alert')

			let alert: Dialog = await condition.waitForEvent(page)
			expect(alert.message()).to.equal('ok')
			await alert.dismiss()
		})

		it('waits Until.alertIsPresent confirm', async () => {
			let condition = Until.alertIsPresent()

			page.click('#confirm')

			let alert: Dialog = await condition.waitForEvent(page)
			expect(alert.message()).to.equal('set the value')
			await alert.accept()
		})

		it('waits Until.alertIsPresent prompt', async () => {
			let condition = Until.alertIsPresent()

			page.click('#prompt')

			let alert: Dialog = await condition.waitForEvent(page)
			expect(alert.message()).to.equal('enter your name')
			await alert.accept('Ivan')
		})
	})
})
