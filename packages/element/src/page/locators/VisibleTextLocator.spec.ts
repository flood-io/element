import { serve } from '../../../tests/support/fixture-server'
import { launchPuppeteer, testPuppeteer } from '../../../tests/support/launch-browser'
import { VisibleTextLocator } from './VisibleTextLocator'

let puppeteer: testPuppeteer

describe('VisibleTextLocator', () => {
	beforeAll(async () => {
		puppeteer = await launchPuppeteer()
	})

	afterAll(async () => {
		await puppeteer.close()
	})

	beforeEach(async () => {
		let url = await serve('wait.html')
		await puppeteer.page.goto(url, { waitUntil: 'domcontentloaded' })
	})

	test('evaluates', async () => {
		const loc = new VisibleTextLocator('foo', false, 'By.visibleText')
		const ctx = await puppeteer.page.mainFrame().executionContext()

		const maybeElement = await loc.find(ctx)
		if (maybeElement === null) {
			throw new Error("visible text locator didn't match an element")
		}

		expect(await maybeElement.text()).toBe('foo')
	})

	test('escapes target text correctly', async () => {
		const loc = new VisibleTextLocator("foon't", false, 'By.visibleText')
		const ctx = await puppeteer.page.mainFrame().executionContext()

		let maybeElement: any

		expect(async () => {
			maybeElement = await loc.find(ctx)
		}).not.toThrowError()

		expect(maybeElement).toBeUndefined()
	})
})
