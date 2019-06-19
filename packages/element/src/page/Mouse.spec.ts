import { expect } from 'chai'
import 'mocha'
import { Page, ElementHandle } from 'puppeteer'
import { launchPuppeteer, testPuppeteer } from '../../tests/support/launch-browser'
import { DogfoodServer } from '../../tests/support/fixture-server'
import { Browser } from '../runtime/Browser'
import { testWorkRoot } from '../../tests/support/test-run-env'
import { DEFAULT_SETTINGS } from '../../dist'

let dogfoodServer = new DogfoodServer()
let page: Page
let puppeteer: testPuppeteer
const workRoot = testWorkRoot()
let browser: Browser<any>

const getText = async (selector: string): Promise<string> => {
	return page.$eval(selector, (element: HTMLParagraphElement) => element.textContent!.trim())
}

const getDropReports = async () => {
	return getText('#drop_reports')
}

const timeout = async (duration: number): Promise<any> =>
	new Promise(yeah => setTimeout(yeah, duration))

const centerPoint = async (element: ElementHandle): Promise<[number, number]> => {
	let box = await element!.boundingBox()
	let { x, y, height, width } = box!
	let cx = (x + x + width) / 2
	let cy = (y + y + height) / 2
	return [cx, cy]
}

describe('Mouse', function() {
	this.timeout(30e3)

	before(async () => {
		await dogfoodServer.start()
		puppeteer = await launchPuppeteer()
		page = puppeteer.page

		browser = new Browser(workRoot, puppeteer, DEFAULT_SETTINGS)
		await browser.visit('http://localhost:1337/drag_and_drop.html')
	})

	after(async () => {
		await puppeteer.close()
		await dogfoodServer.close()
	})

	it('can move mouse', async () => {
		await browser.mouse.move([0, 0], [156, 63], [157, 65])
		expect(await getDropReports()).to.equal('start move move')
	})

	it('can drag and drop', async () => {
		let handleEl = await page.$('#draggable')
		let targetEl = await page.$('#droppable')
		let startingPoint = await centerPoint(handleEl!)
		let finishPoint = await centerPoint(targetEl!)

		// console.log(`Drag handle from ${startingPoint} -> ${finishPoint}`)

		await browser.mouse.drag(startingPoint, finishPoint)
		await timeout(100)
		expect(await getText('#droppable')).to.equal('Dropped!')
		expect(await getDropReports()).to.equal('start move move move down move dragstart drag up drop')
	})
})
