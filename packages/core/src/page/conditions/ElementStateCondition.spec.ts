import { serve } from '../../../tests/support/fixture-server'
import { launchPlaywright, testPlaywright } from '../../../tests/support/launch-browser'
import { Page } from 'playwright'
import { Until } from '../Until'
import { By } from '../By'

let page: Page, playwright: testPlaywright

describe('Condition', () => {
	jest.setTimeout(30e3)

	beforeEach(async () => {
		playwright = await launchPlaywright()
		page = playwright.page
		page.on('console', (msg) => console.log(`>> console.${msg.type()}: ${msg.text()}`))

		await page.goto(await serve('wait.html'), { waitUntil: 'networkidle' })
	})

	afterEach(async () => {
		await playwright.close()
	})

	describe('ElementStateCondition', () => {
		test('waits Until.elementIsEnabled', async () => {
			const condition = Until.elementIsEnabled(By.css('#btn'))

			// Triggers a timeout of 500ms
			await page.click('a#enable_btn')

			const found = await condition.waitFor(page.mainFrame())
			expect(found).toBe(true)
		}, 31e3)

		test('waits Until.elementIsDisabled', async () => {
			await page.evaluate(() => {
				const btn = document.querySelector('#btn')
				if (btn) {
					btn.removeAttribute('disabled')
				}
			})
			const btn = await page.$('#btn')

			expect(btn).not.toBeNull()
			if (!btn) throw new Error('#btn was null')

			expect(await btn.evaluate((el) => el.hasAttribute('disabled'), btn)).toBe(false)

			const condition = Until.elementIsDisabled(By.css('#btn'))

			await page.click('#btn')

			const found = await condition.waitFor(page.mainFrame())
			expect(found).toBe(true)
		}, 31e3)
	})
})
