import { serve } from '../../../tests/support/fixture-server'
import { launchPlaywright, testPlaywright } from '../../../tests/support/launch-browser'
import { Page, Frame } from 'playwright'
import { Until } from '../Until'
import { By } from '../By'

let page: Page, playwright: testPlaywright

describe('Condition', () => {
	jest.setTimeout(30e3)
	describe('FrameCondition', () => {
		beforeAll(async () => {
			playwright = await launchPlaywright()
			page = playwright.page
		})

		afterAll(async () => {
			await playwright.close()
		})

		beforeEach(async () => {
			await page.goto(await serve('nested_frames.html'))
		})

		test('waits Until.ableToSwitchToFrame with frame name', async () => {
			const condition = Until.ableToSwitchToFrame('one')
			const frame = (await condition.waitFor(page.mainFrame(), page)) as Frame
			expect(frame.name()).toBe('one')
			expect(
				await frame.$eval('body', body => (body.textContent ? body.textContent.trim() : '')),
			).toBe('frame 1')
		})

		test.skip('waits Until.ableToSwitchToFrame with Locatable', async () => {
			const condition = Until.ableToSwitchToFrame(By.id('one'))
			const frame = (await condition.waitFor(page.mainFrame(), page)) as Frame
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
