import { Page, ElementHandle } from 'playwright'
import { launchPlaywright, testPlaywright } from '../../tests/support/launch-browser'
import { serve } from '../../tests/support/fixture-server'
import { Browser } from '../runtime/Browser'
import { testWorkRoot } from '../../tests/support/test-run-env'
import { DEFAULT_SETTINGS } from '../runtime/Settings'

let page: Page
let playwright: testPlaywright
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
	const box = await element.boundingBox()
	if (box === null) {
		throw new Error('element.boundingBox() returned null')
	}
	const { x, y, height, width } = box
	const cx = (x + x + width) / 2
	const cy = (y + y + height) / 2
	return [cx, cy]
}

describe('Mouse', () => {
	jest.setTimeout(30e3)

	beforeAll(async () => {
		playwright = await launchPlaywright()
		page = playwright.page

		browser = new Browser(workRoot, playwright, DEFAULT_SETTINGS)

		const url = await serve('drag_and_drop.html')
		await browser.visit(url)
	})

	afterAll(async () => {
		await playwright.close()
	})

	test('can move mouse', async () => {
		for (const point of [
			[0, 0],
			[156, 63],
			[157, 65],
		]) {
			await browser.mouse.move(point[0], point[1])
		}

		expect(await getDropReports()).toBe('start move move')
	})

	test('can drag and drop', async () => {
		const handleEl = await page.$('#draggable')
		const targetEl = await page.$('#droppable')

		if (handleEl === null) {
			throw new Error('handleEl is null')
		}

		if (targetEl === null) {
			throw new Error('targetEl is null')
		}

		const startingPoint = await centerPoint(handleEl)
		const finishPoint = await centerPoint(targetEl)

		// console.log(`Drag handle from ${startingPoint} -> ${finishPoint}`)

		await browser.mouse.drag(startingPoint, finishPoint)
		await timeout(100)
		expect(await getText('#droppable')).toBe('Dropped!')
		expect(await getDropReports()).toBe('start move move move down move dragstart drag up drop')
	})
})
