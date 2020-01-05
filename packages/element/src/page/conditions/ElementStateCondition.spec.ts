import { DogfoodServer } from '../../../tests/support/fixture-server'
import { launchPuppeteer, testPuppeteer } from '../../../tests/support/launch-browser'
import { Page } from 'puppeteer'
import { Until } from '../Until'
import { By } from '../By'

let dogfoodServer = new DogfoodServer()

let page: Page, puppeteer: testPuppeteer

describe('Condition', () => {
	jest.setTimeout(30e3)
	beforeAll(async () => {
		await dogfoodServer.start()
	})

	afterAll(async () => {
		await dogfoodServer.close()
	})

	beforeEach(async () => {
		puppeteer = await launchPuppeteer()
		page = puppeteer.page
		page.on('console', msg => console.log(`>> console.${msg.type()}: ${msg.text()}`))
		await page.goto('http://localhost:1337/wait.html', { waitUntil: 'networkidle2' })
	})

	afterEach(async () => {
		await puppeteer.close()
	})

	describe('ElementStateCondition', () => {
		test('waits Until.elementIsEnabled', async () => {
			let condition = Until.elementIsEnabled(By.css('#btn'))

			// Triggers a timeout of 500ms
			await page.click('a#enable_btn')

			let found = await condition.waitFor(page.mainFrame())
			expect(found).toBe(true)
		}, 31e3)

		test('waits Until.elementIsDisabled', async () => {
			await page.evaluate(() => {
				const btn = document.querySelector('#btn')
				if (btn) {
					btn.removeAttribute('disabled')
				}
			})
			let btn = await page.$('#btn')

			expect(btn).not.toBeNull()
			if (!btn) throw new Error('#btn was null')

			expect(await btn.executionContext().evaluate(el => el.hasAttribute('disabled'), btn)).toBe(
				false,
			)

			let condition = Until.elementIsDisabled(By.css('#btn'))

			await page.click('#btn')

			let found = await condition.waitFor(page.mainFrame())
			expect(found).toBe(true)
		}, 31e3)
	})
})
