import { serve } from '../../../tests/support/fixture-server'
import { launchPlaywright, testPlaywright } from '../../../tests/support/launch-browser'
import { VisibleTextLocator } from './VisibleTextLocator'
import { BaseLocator } from '../Locator'

let playwright: testPlaywright

describe('VisibleTextLocator', () => {
	beforeAll(async () => {
		playwright = await launchPlaywright()
	})

	afterAll(async () => {
		await playwright.close()
	})

	beforeEach(async () => {
		const url = await serve('wait.html')
		await playwright.page.goto(url, { waitUntil: 'domcontentloaded' })
	})

	test('evaluates', async () => {
		const loc = new BaseLocator(new VisibleTextLocator('foo', false), 'By.visibleText')
		const ctx = await playwright.page

		const maybeElement = await loc.find(ctx)

		expect(maybeElement).not.toBeNull()
		expect(await maybeElement?.text()).toBe('foo')
	})

	test('escapes target text correctly', async () => {
		const loc = new BaseLocator(new VisibleTextLocator("foon't", false), 'By.visibleText')
		const ctx = await playwright.page

		let maybeElement: unknown

		expect(async () => {
			maybeElement = await loc.find(ctx)
		}).not.toThrowError()

		expect(maybeElement).toBeUndefined()
	})
})
