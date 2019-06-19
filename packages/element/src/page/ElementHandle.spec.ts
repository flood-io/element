import { ElementHandle } from './ElementHandle'
import { expect } from 'chai'
import 'mocha'
import { DogfoodServer } from '../../tests/support/fixture-server'
import { ElementHandle as PElementHandle } from 'puppeteer'
import { launchPuppeteer, testPuppeteer } from '../../tests/support/launch-browser'
import { Browser } from '../runtime/Browser'
import { DEFAULT_SETTINGS } from '../runtime/Settings'
import { testWorkRoot } from '../../tests/support/test-run-env'
let dogfoodServer = new DogfoodServer()

let puppeteer: testPuppeteer

async function locateEl(selector: string): Promise<PElementHandle | never> {
	const maybeEl = await puppeteer.page.$(selector)
	if (maybeEl === null || maybeEl === undefined) {
		throw new Error(`unable to find element via selector ${selector}`)
	} else {
		return maybeEl
	}
}

describe('ElementHandle', function() {
	this.timeout(30e3)
	before(async () => {
		await dogfoodServer.start()

		puppeteer = await launchPuppeteer()
		puppeteer.page.setViewport({
			height: 600,
			width: 800,
			deviceScaleFactor: 1,
			hasTouch: false,
			isLandscape: true,
			isMobile: false,
		})
	})

	after(async () => {
		await dogfoodServer.close()
		await puppeteer.close()
	})

	beforeEach(async () => {
		await puppeteer.page.goto('http://localhost:1337/wait.html', { waitUntil: 'domcontentloaded' })
	})

	it('getAttribute(id)', async () => {
		const handle = await locateEl('a#show_bar')
		let element = await new ElementHandle(handle)
		expect(await element.getAttribute('id')).to.deep.equal('show_bar')
		await handle.dispose()
	})

	it('getAttribute(href)', async () => {
		const handle = await locateEl('a#show_bar')
		let element = await new ElementHandle(handle)
		expect(await element.getAttribute('href')).to.deep.equal('#')
		await handle.dispose()
	})

	it('tagName()', async () => {
		const handle = await locateEl('a#show_bar')
		let element = await new ElementHandle(handle)
		expect(await element.tagName()).to.equal('A')
		await handle.dispose()
	})

	it('getId()', async () => {
		const handle = await locateEl('a#show_bar')
		let element = await new ElementHandle(handle)
		expect(await element.getId()).to.equal('show_bar')
		await handle.dispose()
	})

	it('isSelected()', async () => {
		const handle = await locateEl('#languages option')
		let element = await new ElementHandle(handle)
		expect(await element.isSelected()).to.equal(true)
		await handle.dispose()
	})

	it('isSelectable()', async () => {
		const handle = await locateEl('#languages option')
		let element = await new ElementHandle(handle)
		expect(await element.isSelectable()).to.equal(true)
		await handle.dispose()
	})

	it('text()', async () => {
		const handle = await locateEl('a#show_bar')
		let element = await new ElementHandle(handle)
		expect(await element.text()).to.equal('show bar')
		await handle.dispose()
	})

	it('size()', async () => {
		const handle = await locateEl('a#show_bar')
		let element = await new ElementHandle(handle)
		expect((await element.size()).width).to.be.within(57, 60)
		expect((await element.size()).height).to.be.within(15, 20)
		await handle.dispose()
	})

	it('location()', async () => {
		const handle = await locateEl('a#show_bar')
		let element = await new ElementHandle(handle)
		expect(await element.location()).to.deep.equal({ x: 8, y: 26 })
		await handle.dispose()
	})

	it('click()', async () => {
		const handle = await locateEl('a#show_bar')
		let element = await new ElementHandle(handle)
		await element.click()
		await handle.dispose()
	})

	it('clear() input', async () => {
		await puppeteer.page.goto('http://localhost:1337/forms_with_input_elements.html')
		const handle: PElementHandle = await locateEl('input[name="new_user_first_name"]')
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
		const handle: PElementHandle = await locateEl('select')
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
		const handle: PElementHandle = await locateEl('#bar')
		let element = await new ElementHandle(handle)

		expect(await element.isDisplayed()).to.be.false

		await puppeteer.page.click('#show_bar')
		await puppeteer.page.waitForSelector('#bar', { visible: true, timeout: 5e3 })

		expect(await element.isDisplayed()).to.be.true

		await handle.dispose()
	})

	it('isEnabled()', async () => {
		const handle: PElementHandle = await locateEl('#btn')
		let element = await new ElementHandle(handle)

		expect(await element.isEnabled()).to.be.false

		await puppeteer.page.click('#enable_btn')
		await puppeteer.page.waitForFunction(
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
		await puppeteer.page.goto('http://localhost:1337/forms_with_input_elements.html')
		const handle: PElementHandle = await locateEl('form')
		let element = await new ElementHandle(handle)
		let element2 = await element.findElement('input[name="new_user_first_name"]')
		let element3 = await element.findElement('h2')

		expect(element2).to.not.be.null
		expect(element3).to.be.null

		if (element2 !== null) {
			expect(await element2.getId()).to.equal('new_user_first_name')
		}
	})

	it('findElements()', async () => {
		await puppeteer.page.goto('http://localhost:1337/forms_with_input_elements.html')
		const handle: PElementHandle = await locateEl('form')
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

	describe('uploadFile', () => {
		let browser: Browser<any>
		beforeEach(async () => {
			browser = new Browser(testWorkRoot(), puppeteer, DEFAULT_SETTINGS)
			await browser.visit('http://localhost:1337/forms_with_input_elements.html')
		})

		afterEach(async () => {
			await puppeteer.close()
		})

		it('uploads a file to a file input', async () => {
			const handle: PElementHandle = await locateEl('#new_user_portrait')
			let element = await new ElementHandle(handle)
			element.bindBrowser(browser)

			expect(await element.getProperty('value')).to.be.empty
			await element.uploadFile('picture.png')
			expect(await element.getProperty('value')).to.equal('C:\\fakepath\\picture.png')
		})
	})
})
