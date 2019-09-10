import Sinon from 'sinon'
import SinonChai from 'sinon-chai'
import { expect, use } from 'chai'
import 'mocha'
import { DogfoodServer } from '../../tests/support/fixture-server'
import { testWorkRoot } from '../../tests/support/test-run-env'
import { launchPuppeteer, testPuppeteer } from '../../tests/support/launch-browser'
import { Browser } from './Browser'
import { Until } from '../page/Until'
import { By } from '../page/By'
import { DEFAULT_SETTINGS } from './Settings'
let dogfoodServer = new DogfoodServer()

use(SinonChai)

let puppeteer: testPuppeteer
const workRoot = testWorkRoot()

function ensureDefined<T>(value: T | undefined | null): T | never {
	if (value === undefined || value === null) {
		throw new Error('value was not defined')
	} else {
		return value
	}
}

describe('Browser', function() {
	this.timeout(30e3)
	before(async () => {
		await dogfoodServer.start()
		puppeteer = await launchPuppeteer()

		puppeteer.page.on('console', msg =>
			console.log(`>> remote console.${msg.type()}: ${msg.text()}`),
		)
	})

	after(async () => {
		await dogfoodServer.close()
		await puppeteer.close()
	})

	it('fires callbacks on action command calls', async () => {
		let beforeSpy = Sinon.spy()
		let afterSpy = Sinon.spy()

		let browser = new Browser(
			workRoot,
			puppeteer,
			DEFAULT_SETTINGS,
			async (_browser, actionName) => {
				beforeSpy(actionName)
			},
			async (_browser, actionName) => {
				afterSpy(actionName)
			},
		)
		await browser.visit('http://localhost:1337/forms_with_input_elements.html')

		expect(beforeSpy).to.have.been.calledWith('visit')
		expect(afterSpy).to.have.been.calledWith('visit')
	})

	it('throws an error', async () => {
		let noErrorSpy = Sinon.spy()

		let browser = new Browser(
			workRoot,
			puppeteer,
			{ ...DEFAULT_SETTINGS },
			async name => {},
			async name => {},
		)
		await browser.visit('http://localhost:1337/forms_with_input_elements.html')

		let caughtError: Error | undefined
		try {
			await browser.click('.notanelement')
			noErrorSpy()
		} catch (e) {
			caughtError = e
		}
		expect(noErrorSpy).to.not.have.been.called
		expect(ensureDefined(caughtError)).to.be.an('error')
	})

	it('returns active element', async () => {
		let browser = new Browser(workRoot, puppeteer, DEFAULT_SETTINGS)
		await browser.visit('http://localhost:1337/forms_with_input_elements.html')
		await browser.wait(Until.elementIsVisible(By.id('new_user_first_name')))
		let el1 = ensureDefined(await browser.switchTo().activeElement())
		expect(await el1.getId()).to.equal('new_user_first_name')
	})

	describe('Frame handling', () => {
		let browser: Browser<any>

		beforeEach(async () => {
			browser = new Browser(workRoot, puppeteer, DEFAULT_SETTINGS)
			await browser.visit('http://localhost:1337/frames.html')
		})

		it('can list all frames', async () => {
			let frames = browser.frames
			expect(frames).to.have.lengthOf(3)
			expect(frames.map(f => f.name())).to.deep.equal(['', 'frame1', 'frame2'])
		})

		it('can switch frame by index', async () => {
			await browser.switchTo().frame(0)
			expect(browser.target.name()).to.equal('frame1')
			await browser.switchTo().frame(1)
			expect(browser.target.name()).to.equal('frame2')
			await browser.switchTo().defaultContent()
			expect(browser.target.name()).to.equal('')
		})

		it('can switch frame by name', async () => {
			await browser.switchTo().frame('frame1')
			expect(browser.target.name()).to.equal('frame1')
			await browser.switchTo().frame('frame2')
			expect(browser.target.name()).to.equal('frame2')
			await browser.switchTo().defaultContent()
			expect(browser.target.name()).to.equal('')
		})

		it('can switch frame using ElementHandle', async () => {
			let frame = await browser.findElement('frame[name="frame1"]')
			await browser.switchTo().frame(frame)
			expect(browser.target.name()).to.equal('frame1')
		})

		it('can interact with another frame', async () => {
			await browser.switchTo().frame('frame1')
			expect(browser.target.name()).to.equal('frame1')

			let input = await browser.findElement('input[name="senderElement"]')
			await input.clear()
			await input.type('Hello World')
			expect(await input.getProperty('value')).to.equal('Hello World')
		})
	})

	describe.skip('timing', () => {
		it('can inject polyfill for TTI', async () => {
			let browser = new Browser(workRoot, puppeteer, DEFAULT_SETTINGS)
			await browser.visit('https://www.google.com')

			let result = await browser.interactionTiming()
			expect(result).to.be.greaterThan(10)
		})
	})

	describe('auto waiting', () => {
		it('automatically applies a wait step to actions', async () => {
			let browser = new Browser(workRoot, puppeteer, { ...DEFAULT_SETTINGS, waitUntil: 'visible' })
			await browser.visit('http://localhost:1337/wait.html')

			await browser.click(By.id('add_select'))

			let link = await browser.findElement(By.id('languages'))
			let linkIsVisible = await link.isDisplayed()
			expect(linkIsVisible).to.be.true
		})

		it('fails to return a visible link without waiting', async () => {
			let browser = new Browser(workRoot, puppeteer, DEFAULT_SETTINGS)
			await browser.visit('http://localhost:1337/wait.html')

			await browser.click(By.id('add_select'))

			let selectTag = await browser.findElement(By.id('languages'))
			let selectTagIsVisible = await selectTag.isDisplayed()
			expect(selectTagIsVisible).to.be.false
		})
	})
})
