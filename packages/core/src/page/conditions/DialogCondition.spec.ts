import { serve } from '../../../tests/support/fixture-server'
import { launchPuppeteer, testPuppeteer } from '../../../tests/support/launch-browser'
import { Page, Dialog } from 'puppeteer'
import { Until } from '../Until'

let page: Page, puppeteer: testPuppeteer

describe('Condition', () => {
	jest.setTimeout(30e3)
	describe('DialogCondition', () => {
		beforeAll(async () => {
			puppeteer = await launchPuppeteer()
			page = puppeteer.page
		})

		afterAll(async () => {
			await puppeteer.close()
		})

		beforeEach(async () => {
			await page.goto(await serve('alerts.html'))
		})

		test('waits Until.alertIsPresent alert', async () => {
			const condition = Until.alertIsPresent()

			page.click('#alert')

			const alert: Dialog = await condition.waitForEvent(page)
			expect(alert.message()).toBe('ok')
			await alert.dismiss()
		})

		test('waits Until.alertIsPresent confirm', async () => {
			const condition = Until.alertIsPresent()

			page.click('#confirm')

			const alert: Dialog = await condition.waitForEvent(page)
			expect(alert.message()).toBe('set the value')
			await alert.accept()
		})

		test('waits Until.alertIsPresent prompt', async () => {
			const condition = Until.alertIsPresent()

			page.click('#prompt')

			const alert: Dialog = await condition.waitForEvent(page)
			expect(alert.message()).toBe('enter your name')
			await alert.accept('Ivan')
		})
	})
})
