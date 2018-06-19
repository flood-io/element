import * as Sinon from 'sinon'
import * as SinonChai from 'sinon-chai'
import { expect, use } from 'chai'
import 'mocha'
import { DogfoodServer } from '../../tests/support/fixture-server'
import PuppeteerDriver from '../driver/Puppeteer'
import { Page } from 'puppeteer'
import { Sandbox } from './Sandbox'
import { Until } from '../page/Until'
import { By } from '../page/By'
import { DEFAULT_SETTINGS } from './VM'
let dogfoodServer = new DogfoodServer()

use(SinonChai)

let page: Page, driver: PuppeteerDriver, puppeteer

describe('Sandbox', function() {
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

		let sandbox = new Sandbox(
			puppeteer,
			DEFAULT_SETTINGS,
			async name => {
				beforeSpy(name)
			},
			async name => {
				afterSpy(name)
			},
		)
		await sandbox.visit('http://localhost:1337/forms_with_input_elements.html')

		expect(beforeSpy).to.have.been.calledWith('visit')
		expect(afterSpy).to.have.been.calledWith('visit')
	})

	it('skips the following commands after an error', async () => {
		let errorSpy = Sinon.spy()
		let skipSpy = Sinon.spy()

		let sandbox = new Sandbox(
			puppeteer,
			DEFAULT_SETTINGS,
			async name => {},
			async name => {},
			async err => {
				errorSpy(err.message)
			},
			async name => {
				skipSpy(name)
			},
		)
		await sandbox.visit('http://localhost:1337/forms_with_input_elements.html')
		await sandbox.click('.notanelement')
		await sandbox.click('.anotherelement')
		expect(errorSpy).to.have.been.calledWith(
			"No element was found on the page using '.notanelement'",
		)
		expect(skipSpy).to.have.been.calledWith('click')
	})

	it('returns active element', async () => {
		let sandbox = new Sandbox(puppeteer, DEFAULT_SETTINGS)
		await sandbox.visit('http://localhost:1337/forms_with_input_elements.html')
		await sandbox.wait(Until.elementIsVisible(By.id('new_user_first_name')))
		let el1 = await sandbox.switchTo().activeElement()
		expect(await el1.getId()).to.equal('new_user_first_name')
	})

	describe('Frame handling', () => {
		it('can list all frames', async () => {
			let sandbox = new Sandbox(puppeteer, DEFAULT_SETTINGS)
			await sandbox.visit('http://localhost:1337/frames.html')
			let frames = sandbox.frames
			expect(frames.map(f => f.name())).to.deep.equal(['', 'frame1', 'frame2'])
		})

		it('can switch frame by index', async () => {
			let sandbox = new Sandbox(puppeteer, DEFAULT_SETTINGS)
			await sandbox.visit('http://localhost:1337/frames.html')
			await sandbox.switchTo().frame(0)
			expect(sandbox.target.name()).to.equal('frame1')
			await sandbox.switchTo().frame(1)
			expect(sandbox.target.name()).to.equal('frame2')
			await sandbox.switchTo().defaultContent()
			expect(sandbox.target.name()).to.equal('')
		})

		it('can switch frame by name', async () => {
			let sandbox = new Sandbox(puppeteer, DEFAULT_SETTINGS)
			await sandbox.visit('http://localhost:1337/frames.html')
			await sandbox.switchTo().frame('frame1')
			expect(sandbox.target.name()).to.equal('frame1')
			await sandbox.switchTo().frame('frame2')
			expect(sandbox.target.name()).to.equal('frame2')
			await sandbox.switchTo().defaultContent()
			expect(sandbox.target.name()).to.equal('')
		})

		it('can switch frame using ElementHandle', async () => {
			let sandbox = new Sandbox(puppeteer, DEFAULT_SETTINGS)
			await sandbox.visit('http://localhost:1337/frames.html')
			let frame = await sandbox.findElement('frame[name="frame1"]')
			await sandbox.switchTo().frame(frame)
			expect(sandbox.target.name()).to.equal('frame1')
		})

		it('can interact with another frame', async () => {
			let sandbox = new Sandbox(puppeteer, DEFAULT_SETTINGS)
			await sandbox.visit('http://localhost:1337/frames.html')
			await sandbox.switchTo().frame('frame1')
			expect(sandbox.target.name()).to.equal('frame1')

			let input = await sandbox.findElement('input[name="senderElement"]')
			await input.clear()
			await input.type('Hello World')
			expect(await input.getProperty('value')).to.equal('Hello World')
		})
	})

	describe('timing', () => {
		it('can inject polyfill for TTI', async () => {
			let sandbox = new Sandbox(puppeteer, DEFAULT_SETTINGS)
			await sandbox.visit('https://www.google.com')

			let result = await sandbox.interactionTiming()
			expect(result).to.be.greaterThan(10)
		})
	})
})
