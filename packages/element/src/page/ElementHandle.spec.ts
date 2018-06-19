import { ElementHandle } from './ElementHandle'
import { expect } from 'chai'
import 'mocha'
import { DogfoodServer } from '../../tests/support/fixture-server'
import PuppeteerDriver from '../driver/Puppeteer'
import { ElementHandle as PElementHandle, Page } from 'puppeteer'
import { PuppeteerClient } from '../types'

let dogfoodServer = new DogfoodServer()

let page: Page, driver: PuppeteerDriver, puppeteer: PuppeteerClient
describe('ElementHandle', function() {
	this.timeout(30e3)
	before(async () => {
		await dogfoodServer.start()
		driver = new PuppeteerDriver()
		await driver.launch()
		puppeteer = await driver.client()
		puppeteer.page.setViewport({
			height: 600,
			width: 800,
			deviceScaleFactor: 1,
			hasTouch: false,
			isLandscape: true,
			isMobile: false,
		})
		page = puppeteer.page
	})

	after(async () => {
		await dogfoodServer.close()
		await driver.close()
	})

	beforeEach(async () => {
		await page.goto('http://localhost:1337/wait.html')
	})

	it('getAttribute(id)', async () => {
		const handle = await page.$('a#show_bar')
		let element = await new ElementHandle(handle)
		expect(await element.getAttribute('id')).to.deep.equal('show_bar')
		await handle.dispose()
	})

	it('getAttribute(href)', async () => {
		const handle = await page.$('a#show_bar')
		let element = await new ElementHandle(handle)
		expect(await element.getAttribute('href')).to.deep.equal('#')
		await handle.dispose()
	})

	it('tagName()', async () => {
		const handle = await page.$('a#show_bar')
		let element = await new ElementHandle(handle)
		expect(await element.tagName()).to.equal('A')
		await handle.dispose()
	})

	it('getId()', async () => {
		const handle = await page.$('a#show_bar')
		let element = await new ElementHandle(handle)
		expect(await element.getId()).to.equal('show_bar')
		await handle.dispose()
	})

	it('isSelected()', async () => {
		const handle = await page.$('#languages option')
		let element = await new ElementHandle(handle)
		expect(await element.isSelected()).to.equal(true)
		await handle.dispose()
	})

	it('isSelectable()', async () => {
		const handle = await page.$('#languages option')
		let element = await new ElementHandle(handle)
		expect(await element.isSelectable()).to.equal(true)
		await handle.dispose()
	})

	it('text()', async () => {
		const handle = await page.$('a#show_bar')
		let element = await new ElementHandle(handle)
		expect(await element.text()).to.equal('show bar')
		await handle.dispose()
	})

	it('size()', async () => {
		const handle = await page.$('a#show_bar')
		let element = await new ElementHandle(handle)
		expect((await element.size()).width).to.be.within(57, 60)
		expect((await element.size()).height).to.be.within(15, 20)
		await handle.dispose()
	})

	it('location()', async () => {
		const handle = await page.$('a#show_bar')
		let element = await new ElementHandle(handle)
		expect(await element.location()).to.deep.equal({ x: 8, y: 26 })
		await handle.dispose()
	})

	it('click()', async () => {
		const handle = await page.$('a#show_bar')
		let element = await new ElementHandle(handle)
		await element.click()
		await handle.dispose()
	})

	it('clear() input', async () => {
		await page.goto('http://localhost:1337/forms_with_input_elements.html')
		const handle: PElementHandle = await page.$('input[name="new_user_first_name"]')
		let element = await new ElementHandle(handle)

		await element.type('user@example.com')

		let value = await handle
			.executionContext()
			.evaluate((element: HTMLInputElement) => element.value, handle)
		expect(value).to.equal('user@example.com')

		await element.clear()

		value = await handle
			.executionContext()
			.evaluate((element: HTMLInputElement) => element.value, handle)
		expect(value).to.equal('')
		await handle.dispose()
	})

	it('clear() select', async () => {
		const handle: PElementHandle = await page.$('select')
		let element = await new ElementHandle(handle)
		let value = await handle
			.executionContext()
			.evaluate((element: HTMLInputElement) => element.value, handle)
		expect(value).to.equal('3')

		await element.clear()

		value = await handle
			.executionContext()
			.evaluate((element: HTMLInputElement) => element.value, handle)
		expect(value).to.equal('')
		await handle.dispose()
	})

	it('isDisplayed()', async () => {
		const handle: PElementHandle = await page.$('#bar')
		let element = await new ElementHandle(handle)

		expect(await element.isDisplayed()).to.be.false

		await page.click('#show_bar')
		await page.waitForSelector('#bar', { visible: true, timeout: 5e3 })

		expect(await element.isDisplayed()).to.be.true

		await handle.dispose()
	})

	it('isEnabled()', async () => {
		const handle: PElementHandle = await page.$('#btn')
		let element = await new ElementHandle(handle)

		expect(await element.isEnabled()).to.be.false

		await page.click('#enable_btn')
		await page.waitForFunction(
			(selector: string) => {
				let element = document.querySelector(selector) as HTMLButtonElement
				return !element.disabled
			},
			{ polling: 'mutation', timeout: 5e3 },
			'#btn',
		)

		expect(await element.isEnabled()).to.be.true

		await handle.dispose()
	})

	it('findElement()', async () => {
		await page.goto('http://localhost:1337/forms_with_input_elements.html')
		const handle: PElementHandle = await page.$('form')
		let element = await new ElementHandle(handle)
		let element2 = await element.findElement('input[name="new_user_first_name"]')
		let element3 = await element.findElement('h2')
		expect(element2).to.not.be.null
		expect(element3).to.be.null
		expect(await element2.getId()).to.equal('new_user_first_name')
	})

	it('findElements()', async () => {
		await page.goto('http://localhost:1337/forms_with_input_elements.html')
		const handle: PElementHandle = await page.$('form')
		let element = await new ElementHandle(handle)
		let elementsList1 = await element.findElements('input')
		let elementsList2 = await element.findElements('h2')
		expect(elementsList1.length).to.equal(45)
		expect(elementsList2.length).to.equal(0)

		let displayedElements = await Promise.all(
			elementsList1.map((e, index) => e.isDisplayed()),
		).then(result => elementsList1.filter((element, index) => result[index]))

		expect(displayedElements.length).to.equal(43)
	})
})
