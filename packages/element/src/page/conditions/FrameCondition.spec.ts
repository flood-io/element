import { expect } from 'chai'
import 'mocha'
import { DogfoodServer } from '../../../tests/support/fixture-server'
import PuppeteerDriver from '../../driver/Puppeteer'
import { Page, Frame } from 'puppeteer'
import { Until } from '../Until'
import { By } from '../By'

let dogfoodServer = new DogfoodServer()

let page: Page, driver: PuppeteerDriver, puppeteer

describe('Condition', function() {
	this.timeout(30e3)
	describe('FrameCondition', () => {
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
			await page.goto('http://localhost:1337/nested_frames.html')
		})

		const trimSafe = x => (x ? x.trim() : '')

		it('waits Until.ableToSwitchToFrame with frame name', async () => {
			let condition = Until.ableToSwitchToFrame('one')
			let frame: Frame = await condition.waitFor(page.mainFrame(), page)
			expect(frame.name()).to.equal('one')
			expect(await frame.$eval('body', body => trimSafe(body.textContent))).to.equal('frame 1')
		})

		it.skip('waits Until.ableToSwitchToFrame with Locatable', async () => {
			let condition = Until.ableToSwitchToFrame(By.id('one'))
			let frame: Frame = await condition.waitFor(page.mainFrame(), page)
			expect(frame.name()).to.equal('one')
			expect(await frame.$eval('body', body => trimSafe(body.textContent))).to.equal('frame 1')
		})

		it.skip('waits Until.ableToSwitchToFrame with frame index', async () => {
			// let condition = Until.ableToSwitchToFrame(2)
			// let frame = await condition.waitForEvent(page)
			// expect(frame.name()).to.equal('frame1')
		})
	})
})
