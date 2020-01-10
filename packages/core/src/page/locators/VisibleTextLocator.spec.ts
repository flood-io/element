import { serve } from '../../../tests/support/fixture-server'
import { launchPuppeteer, testPuppeteer } from '../../../tests/support/launch-browser'
import { VisibleTextLocator } from './VisibleTextLocator'
import { BaseLocator } from '../Locator'

let puppeteer: testPuppeteer

describe('VisibleTextLocator', () => {
	beforeAll(async () => {
		puppeteer = await launchPuppeteer()
	})

	afterAll(async () => {
		await puppeteer.close()
	})

	beforeEach(async () => {
		const url = await serve('wait.html')
		await puppeteer.page.goto(url, { waitUntil: 'domcontentloaded' })
	})

	test('evaluates', async () => {
		const loc = new BaseLocator(new VisibleTextLocator('foo', false), 'By.visibleText')
		const ctx = await puppeteer.page.mainFrame().executionContext()

		const maybeElement = await loc.find(ctx)

		expect(maybeElement).toBeDefined()
		expect(await maybeElement.text()).toBe('foo')
	})

	test('escapes target text correctly', async () => {
		const loc = new BaseLocator(new VisibleTextLocator("foon't", false), 'By.visibleText')
		const ctx = await puppeteer.page.mainFrame().executionContext()

		let maybeElement: any

		expect(async () => {
			maybeElement = await loc.find(ctx)
		}).not.toThrowError()

		expect(maybeElement).toBeUndefined()
	})
})
