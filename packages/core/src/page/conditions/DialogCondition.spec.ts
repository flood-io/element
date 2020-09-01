import { serve } from '../../../tests/support/fixture-server'
import { launchPlaywright, testPlaywright } from '../../../tests/support/launch-browser'
import { Page, Dialog } from 'playwright'
import { Until } from '../Until'

let page: Page, playwright: testPlaywright

describe('Condition', () => {
	jest.setTimeout(30e3)
	describe('DialogCondition', () => {
		beforeAll(async () => {
			playwright = await launchPlaywright()
			page = playwright.page
		})

		afterAll(async () => {
			await playwright.close()
		})

		beforeEach(async () => {
			await page.goto(await serve('alerts.html'))
		})

		test('waits Until.alertIsPresent alert', async () => {
			const condition = Until.alertIsPresent()

			page.click('#alert')

			const alert: Dialog = await condition.waitForEvent(page)
			expect(alert).not.toBeNull()
			expect(alert.message()).toBe('ok')
			await alert.dismiss()
		})

		test('waits Until.alertIsPresent confirm', async () => {
			const condition = Until.alertIsPresent()

			page.click('#confirm')

			const alert: Dialog | null = await condition.waitForEvent(page)
			expect(alert).not.toBeNull()
			expect(alert.message()).toBe('set the value')
			await alert.accept()
		})

		test('waits Until.alertIsPresent prompt', async () => {
			const condition = Until.alertIsPresent()
			await page.waitForSelector('#prompt', { state: 'visible' })

			page.click('#prompt', { delay: 100 })

			const alert = await condition.waitForEvent(page)
			expect(alert).not.toBeNull()
			expect(alert.message()).toBe('enter your name')
			await alert.accept('Ivan')

			await page.waitForSelector('#prompt', { state: 'visible' })
		})
	})
})
