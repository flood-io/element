import { serve } from '../../../tests/support/fixture-server'
import { launchPlaywright, testPlaywright } from '../../../tests/support/launch-browser'
import { Page } from 'playwright'
import { Until } from '../Until'
import { By } from '../By'

let page: Page, playwright: testPlaywright

describe('Condition', () => {
	jest.setTimeout(30e3)
	beforeAll(async () => {
		playwright = await launchPlaywright()
		page = playwright.page
		page.on('console', (msg) => console.log(`>> console.${msg.type()}: ${msg.text()}`))
	})

	afterAll(async () => {
		await playwright.close()
	})

	beforeEach(async () => {
		await page.goto(await serve('forms_with_input_elements.html'), {
			waitUntil: 'networkidle',
		})
	})

	describe('ElementSelectedCondition', () => {
		test('waits Until.elementIsSelected', async () => {
			// Wait until Sweden is selected
			const condition = Until.elementIsSelected(By.css('select#new_user_country option[value="3"]'))
			page.selectOption('select#new_user_country', '3')
			const found = await condition.waitFor(page.mainFrame(), undefined)
			expect(found).toBe(true)
		}, 31e3)

		test('waits Until.elementIsNotSelected', async () => {
			const condition = Until.elementIsNotSelected(
				By.css('select#new_user_country option[value="2"]')
			)
			page.selectOption('select#new_user_country', '3')
			const found = await condition.waitFor(page.mainFrame(), undefined)
			expect(found).toBe(true)
		}, 31e3)
	})
})
