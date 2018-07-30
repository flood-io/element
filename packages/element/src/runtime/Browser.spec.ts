import * as Sinon from 'sinon'
import * as SinonChai from 'sinon-chai'
import { expect, use } from 'chai'
import 'mocha'
import { DogfoodServer } from '../../tests/support/fixture-server'
import { testWorkRoot } from '../../tests/support/test-run-env'
import PuppeteerDriver from '../driver/Puppeteer'
import { Page } from 'puppeteer'
import { Browser } from './Browser'
import { Until } from '../page/Until'
import { By } from '../page/By'
import { DEFAULT_SETTINGS } from './VM'
let dogfoodServer = new DogfoodServer()

use(SinonChai)

let page: Page, driver: PuppeteerDriver, puppeteer
const workRoot = testWorkRoot()

describe('Browser', function() {
	this.timeout(30e3)
	before(async () => {
		await dogfoodServer.start()
		driver = new PuppeteerDriver()
		await driver.launch()
		puppeteer = await driver.client()
		page = puppeteer.page
		page.on('console', msg => console.log(`>> remote console.${msg.type()}: ${msg.text()}`))
	})

	after(async () => {
		await dogfoodServer.close()
		await driver.close()
	})

	it('fires callbacks on action command calls', async () => {
		let beforeSpy = Sinon.spy()
		let afterSpy = Sinon.spy()

		let browser = new Browser(
			workRoot,
			puppeteer,
			DEFAULT_SETTINGS,
			async name => {
				beforeSpy(name)
			},
			async name => {
				afterSpy(name)
			},
		)
		await browser.visit('http://localhost:1337/forms_with_input_elements.html')

		expect(beforeSpy).to.have.been.calledWith('visit')
		expect(afterSpy).to.have.been.calledWith('visit')
	})

	it('throws an error', async () => {
		let browser = new Browser(
			workRoot,
			puppeteer,
			DEFAULT_SETTINGS,
			async name => {},
			async name => {},
		)
		await browser.visit('http://localhost:1337/forms_with_input_elements.html')

		let caughtError: Error = undefined
		try {
			await browser.click('.notanelement')
		} catch (e) {
			caughtError = e
		}
		expect(caughtError).to.be.an('error')
	})

	it('returns active element', async () => {
		let browser = new Browser(workRoot, puppeteer, DEFAULT_SETTINGS)
		await browser.visit('http://localhost:1337/forms_with_input_elements.html')
		await browser.wait(Until.elementIsVisible(By.id('new_user_first_name')))
		let el1 = await browser.switchTo().activeElement()
		expect(await el1.getId()).to.equal('new_user_first_name')
	})

	describe('Frame handling', () => {
		it('can list all frames', async () => {
			let browser = new Browser(workRoot, puppeteer, DEFAULT_SETTINGS)
			await browser.visit('http://localhost:1337/frames.html')
			let frames = browser.frames
			expect(frames.map(f => f.name())).to.deep.equal(['', 'frame1', 'frame2'])
		})

		it('can switch frame by index', async () => {
			let browser = new Browser(workRoot, puppeteer, DEFAULT_SETTINGS)
			await browser.visit('http://localhost:1337/frames.html')
			await browser.switchTo().frame(0)
			expect(browser.target.name()).to.equal('frame1')
			await browser.switchTo().frame(1)
			expect(browser.target.name()).to.equal('frame2')
			await browser.switchTo().defaultContent()
			expect(browser.target.name()).to.equal('')
		})

		it('can switch frame by name', async () => {
			let browser = new Browser(workRoot, puppeteer, DEFAULT_SETTINGS)
			await browser.visit('http://localhost:1337/frames.html')
			await browser.switchTo().frame('frame1')
			expect(browser.target.name()).to.equal('frame1')
			await browser.switchTo().frame('frame2')
			expect(browser.target.name()).to.equal('frame2')
			await browser.switchTo().defaultContent()
			expect(browser.target.name()).to.equal('')
		})

		it('can switch frame using ElementHandle', async () => {
			let browser = new Browser(workRoot, puppeteer, DEFAULT_SETTINGS)
			await browser.visit('http://localhost:1337/frames.html')
			let frame = await browser.findElement('frame[name="frame1"]')
			await browser.switchTo().frame(frame)
			expect(browser.target.name()).to.equal('frame1')
		})

		it('can interact with another frame', async () => {
			let browser = new Browser(workRoot, puppeteer, DEFAULT_SETTINGS)
			await browser.visit('http://localhost:1337/frames.html')
			await browser.switchTo().frame('frame1')
			expect(browser.target.name()).to.equal('frame1')

			let input = await browser.findElement('input[name="senderElement"]')
			await input.clear()
			await input.type('Hello World')
			expect(await input.getProperty('value')).to.equal('Hello World')
		})
	})

	describe('timing', () => {
		it('can inject polyfill for TTI', async () => {
			let browser = new Browser(workRoot, puppeteer, DEFAULT_SETTINGS)
			await browser.visit('https://www.google.com')

			let result = await browser.interactionTiming()
			expect(result).to.be.greaterThan(10)
		})
	})
})
