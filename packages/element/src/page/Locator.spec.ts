import { expect } from 'chai'
import 'mocha'
import { DogfoodServer } from '../../tests/support/fixture-server'
import { launchPuppeteer, testPuppeteer } from '../../tests/support/launch-browser'
import { Page } from 'puppeteer'
import { Locator, ElementHandle } from './types'
import { By } from './By'

let dogfoodServer = new DogfoodServer()

let page: Page
let puppeteer: testPuppeteer

function ensureElement(value: ElementHandle | undefined | null): ElementHandle | never {
	if (value !== null && value !== undefined) {
		return value
	} else {
		throw new Error("value isn't an element")
	}
}

async function findEl(locator: Locator): Promise<ElementHandle> {
	return ensureElement(await locator.find(await page.mainFrame().executionContext()))
}

describe('Locator', function() {
	this.timeout(30e3)

	before(async () => {
		await dogfoodServer.start()
		puppeteer = await launchPuppeteer()
		page = puppeteer.page
		page.on('console', msg => console.log(`>> console.${msg.type}: ${msg.text}`))
	})

	after(async () => {
		await dogfoodServer.close()
		await puppeteer.close()
	})

	beforeEach(async () => {
		await page.goto('http://localhost:1337/wait.html')
	})

	describe('By.linkText', () => {
		it('find()', async () => {
			let locator = By.linkText('show bar')

			let element = await findEl(locator)
			expect(await element.getAttribute('id')).to.deep.equal('show_bar')
			await element.dispose()
		})

		it('findMany()', async () => {
			let locator = By.linkText('show bar')

			let elements = await locator.findMany(await page.mainFrame().executionContext())
			expect(elements.length).to.equal(1)

			expect(await elements[0].getAttribute('id')).to.deep.equal('show_bar')
			await elements[0].dispose()
		})
	})
	describe('By.partialLinkText', () => {
		it('find()', async () => {
			let locator = By.linkText('show bar')

			let element = await findEl(locator)
			expect(await element.getAttribute('id')).to.deep.equal('show_bar')
			await element.dispose()
		})

		it('findMany()', async () => {
			let locator = By.linkText('show bar')

			let elements = await locator.findMany(await page.mainFrame().executionContext())
			expect(elements.length).to.equal(1)

			expect(await elements[0].getAttribute('id')).to.deep.equal('show_bar')
			await elements[0].dispose()
		})
	})

	describe('By.css', () => {
		it('find()', async () => {
			let locator = By.css('a:first-child')

			let element = await findEl(locator)
			expect(await element.getAttribute('id')).to.deep.equal('change_select')
			await element.dispose()
		})

		it('findMany()', async () => {
			let locator = By.css('a:first-child')

			let elements = await locator.findMany(await page.mainFrame().executionContext())
			expect(elements.length).to.equal(1)

			expect(await elements[0].getAttribute('id')).to.deep.equal('change_select')
			await elements[0].dispose()
		})
	})

	describe('By.visibleText', () => {
		it('find()', async () => {
			let locator = By.visibleText('show bar')
			let element = await findEl(locator)
			expect(element).to.not.be.null
			expect(await element.getAttribute('id')).to.deep.equal('show_bar')
			expect(await element.text()).to.deep.equal('show bar')
			await element.dispose()
		})

		it('findMany()', async () => {
			let locator = By.visibleText('show bar')

			let elements = await locator.findMany(await page.mainFrame().executionContext())
			expect(elements.length).to.equal(1)

			expect(await elements[0].getAttribute('id')).to.deep.equal('show_bar')
			await elements[0].dispose()
		})
	})

	describe('By.partialVisibleText', () => {
		it('find()', async () => {
			let locator = By.partialVisibleText('change select list')

			let element = await findEl(locator)
			expect(element).to.not.be.null
			await element.dispose()
		})

		it('findMany()', async () => {
			let locator = By.partialVisibleText('change select list')

			let elements = await locator.findMany(await page.mainFrame().executionContext())
			expect(elements.length).to.equal(4)

			for (let element of elements) {
				await element.dispose()
			}
		})
	})

	describe('By.js', () => {
		it('find()', async () => {
			let locator = By.js(() => document.querySelector('a[href]'))

			let element = await findEl(locator)
			expect(element).to.not.be.null
			expect(await element.getId()).to.equal('show_bar')
			await element.dispose()
		})

		it('findMany()', async () => {
			let locator = By.js(() => document.querySelectorAll('a[href]'))

			let elements = await locator.findMany(await page.mainFrame().executionContext())
			expect(elements.length).to.equal(8)

			for (let element of elements) {
				await element.dispose()
			}
		})
	})

	describe('By.nameAttr', () => {
		it('find()', async () => {
			let locator = By.nameAttr('add_select')

			let element = await findEl(locator)
			expect(element).to.not.be.null
			expect(await element.getId()).to.equal('add_select')
			await element.dispose()
		})

		it('findMany()', async () => {
			let locator = By.nameAttr('add_select')

			let elements = await locator.findMany(await page.mainFrame().executionContext())
			expect(elements.length).to.equal(1)

			for (let element of elements) {
				await element.dispose()
			}
		})
	})

	describe('By.tagName', () => {
		it('find()', async () => {
			let locator = By.tagName('a')

			let element = await findEl(locator)
			expect(element).to.not.be.null
			expect(await element.getId()).to.equal('show_bar')
			await element.dispose()
		})

		it('findMany()', async () => {
			let locator = By.tagName('a')

			let elements = await locator.findMany(await page.mainFrame().executionContext())
			expect(elements.length).to.equal(8)

			for (let element of elements) {
				await element.dispose()
			}
		})
	})

	describe('By.xpath', () => {
		it('find()', async () => {
			let locator = By.xpath('//a')

			let element = await findEl(locator)
			expect(element).to.not.be.null
			expect(await element.getId()).to.equal('show_bar')
			await element.dispose()
		})

		it('findMany()', async () => {
			let locator = By.xpath('//a')

			let elements = await locator.findMany(await page.mainFrame().executionContext())
			expect(elements.length).to.equal(8)

			for (let element of elements) {
				await element.dispose()
			}
		})
	})
})
