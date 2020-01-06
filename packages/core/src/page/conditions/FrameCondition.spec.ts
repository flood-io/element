import { serve } from '../../../tests/support/fixture-server'
import { launchPuppeteer, testPuppeteer } from '../../../tests/support/launch-browser'
import { Page, Frame } from 'puppeteer'
import { Until } from '../Until'
import { By } from '../By'

let page: Page, puppeteer: testPuppeteer

describe('Condition', () => {
	jest.setTimeout(30e3)
	describe('FrameCondition', () => {
		beforeAll(async () => {
			puppeteer = await launchPuppeteer()
			page = puppeteer.page
		})

		afterAll(async () => {
			await puppeteer.close()
		})

		beforeEach(async () => {
			await page.goto(await serve('nested_frames.html'))
		})

		test('waits Until.ableToSwitchToFrame with frame name', async () => {
			let condition = Until.ableToSwitchToFrame('one')
			let frame: Frame = await condition.waitFor(page.mainFrame(), page)
			expect(frame.name()).toBe('one')
			expect(
				await frame.$eval('body', body => (body.textContent ? body.textContent.trim() : '')),
			).toBe('frame 1')
		})

		test.skip('waits Until.ableToSwitchToFrame with Locatable', async () => {
			let condition = Until.ableToSwitchToFrame(By.id('one'))
			let frame: Frame = await condition.waitFor(page.mainFrame(), page)
			expect(frame.name()).toBe('one')
			expect(
				await frame.$eval('body', body => (body.textContent ? body.textContent.trim() : '')),
			).toBe('frame 1')
		})

		test.skip('waits Until.ableToSwitchToFrame with frame index', async () => {
			// let condition = Until.ableToSwitchToFrame(2)
			// let frame = await condition.waitForEvent(page)
			// expect(frame.name()).to.equal('frame1')
		})
	})
})
