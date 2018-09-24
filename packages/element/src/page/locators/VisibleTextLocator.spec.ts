import 'mocha'
import { expect } from 'chai'
import { DogfoodServer } from '../../../tests/support/fixture-server'
import { launchPuppeteer, testPuppeteer } from '../../../tests/support/launch-browser'

import { VisibleTextLocator } from './VisibleTextLocator'

let dogfoodServer = new DogfoodServer()
let puppeteer: testPuppeteer

describe('VisibleTextLocator', function() {
	before(async () => {
		await dogfoodServer.start()
		puppeteer = await launchPuppeteer()
	})

	after(async () => {
		await dogfoodServer.close()
		await puppeteer.close()
	})

	beforeEach(async () => {
		await puppeteer.page.goto('http://localhost:1337/wait.html', { waitUntil: 'domcontentloaded' })
	})

	it('evaluates', async () => {
		const loc = new VisibleTextLocator('foo', false, 'By.visibleText')
		const ctx = await puppeteer.page.mainFrame().executionContext()

		const maybeElement = await loc.find(ctx)
		if (maybeElement === null) {
			throw new Error("visible text locator didn't match an element")
		}

		expect(await maybeElement.text()).to.equal('foo')
	})

	it('escapes target text correctly', async () => {
		const loc = new VisibleTextLocator("foon't", false, 'By.visibleText')
		const ctx = await puppeteer.page.mainFrame().executionContext()

		let maybeElement

		expect(async () => {
			maybeElement = await loc.find(ctx)
		}).to.not.throw()
		expect(maybeElement).to.be.undefined
	})
})
