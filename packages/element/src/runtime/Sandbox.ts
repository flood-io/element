import { Condition } from '../page/Condition'
import {
	NavigationOptions,
	ClickOptions,
	ExecutionContext,
	Frame,
	Page,
	ScreenshotOptions,
} from 'puppeteer'
import * as DeviceDescriptors from 'puppeteer/DeviceDescriptors'
import CustomDeviceDescriptors from '../utils/CustomDeviceDescriptors'
import { Locator, Locatable } from '../page/Locator'
import { locatableToLocator } from '../page/By'
import { ElementHandle } from '../page/ElementHandle'
import { TargetLocator } from '../page/TargetLocator'
import * as debugFactory from 'debug'
import { Driver, TestSettings, EvaluateFn } from '@flood/chrome'
import { PuppeteerClient, WorkRoot } from '../types'
import { join, resolve } from 'path'
import * as cuid from 'cuid'
import { wrapWithCallbacks } from '../utils/Decorators'
import { DEFAULT_SETTINGS } from './VM'
import { Key } from '../page/Enums'
import { readFileSync } from 'fs'
import * as termImg from 'term-img'

export class ElementNotFound extends Error {
	constructor(locatable: Locatable) {
		let desc = typeof (locatable === 'stering') ? locatable : locatable.toString()
		super(`No element was found on the page using '${desc}'`)
	}
}

export const getFrames = (childFrames: Frame[]): Frame[] => {
	let framesMap = new Map<string, Frame>()
	for (const f of childFrames) {
		framesMap.set(f.name(), f)
		getFrames(f.childFrames()).forEach(f => framesMap.set(f.name(), f))
	}

	return Array.from(framesMap.values())
}

// const debug = debugFactory("element:sandbox");
const debugSandboxScreenshot = debugFactory('element:sandbox:screenshot')

export class Sandbox implements Driver {
	public screenshots: string[]

	constructor(
		public workRoot: WorkRoot,
		private client: PuppeteerClient,
		public settings: TestSettings = DEFAULT_SETTINGS,
		private beforeFunc: (name: string) => Promise<void> = async () => {},
		private afterFunc: (name: string) => Promise<void> = async () => {},
		private onError: (err: Error, name: string) => Promise<void> = async () => {},
		private onSkip: (name: string) => Promise<void> = async () => {},
		private lastError?: Error | null,
		private activeFrame?: Frame | null,
	) {
		this.beforeFunc && this.afterFunc && this.onError && this.onSkip && this.lastError
		this.screenshots = []
	}

	private get context(): Promise<ExecutionContext> {
		// Promise.resolve is a quick fix for TS until the types are updated
		return Promise.resolve(this.target.executionContext())
	}

	public get target(): Frame {
		if (this.activeFrame) {
			if (this.activeFrame.isDetached()) {
				this.activeFrame = null
				throw new Error(`Frame is detached`)
			} else {
				return this.activeFrame
			}
		} else {
			return this.page.mainFrame()
		}
	}

	public get page(): Page {
		return this.client.page
	}

	public get frames(): Frame[] {
		return getFrames(this.page.frames())
	}

	/**
	 * Returns the URL of the current frame/page
	 */
	public get url(): string {
		return this.page.url()
	}

	public async evaluate(fn: EvaluateFn, ...args: any[]): Promise<any> {
		return this.target.evaluate(fn, ...args)
	}

	public async authenticate(username?: string, password?: string): Promise<void> {
		await this.page.authenticate(username ? { username, password } : null)
	}

	@wrapWithCallbacks()
	public async wait(timeoutOrCondition: Condition | number): Promise<boolean> {
		if (typeof timeoutOrCondition === 'number') {
			await new Promise((yeah, nah) => setTimeout(yeah, Number(timeoutOrCondition) * 1e3))
			return true
		}
		let condition = timeoutOrCondition as Condition
		condition.settings = this.settings
		if (condition.hasWaitFor) {
			return condition.waitFor(this.target, this.page)
		} else {
			return condition.waitForEvent(this.page)
		}
	}

	@wrapWithCallbacks()
	public async visit(url: string, options: NavigationOptions = {}): Promise<void> {
		let timeout = this.settings.waitTimeout * 1e3
		await this.page.goto(url, {
			timeout,
			waitUntil: 'domcontentloaded',
			...options,
		})
		return
	}

	/**
	 * Sends a click event to the element located at `selector`. If the element is
	 * currently outside the viewport it will first scroll to that element.
	 */
	@wrapWithCallbacks()
	public async click(selectorOrLocator: Locatable, options?: ClickOptions): Promise<void> {
		let locator = locatableToLocator(selectorOrLocator)

		let element = await locator.find(await this.context)
		if (!element) throw new ElementNotFound(selectorOrLocator)
		return element.click(options)
	}

	/**
	 * Sends a double-click event to the element located by the supplied Locator or `selector`. If the element is
	 * currently outside the viewport it will first scroll to that element.
	 */
	@wrapWithCallbacks()
	public async doubleClick(
		selectorOrLocator: string | Locator,
		options?: ClickOptions,
	): Promise<void> {
		let locator = locatableToLocator(selectorOrLocator)
		let element = await locator.find(await this.context)
		if (!element) throw new ElementNotFound(selectorOrLocator)
		return element.click({ clickCount: 2, ...options })
	}

	@wrapWithCallbacks()
	public async selectByValue(locatable: Locatable, ...values: string[]): Promise<string[]> {
		let locator = locatableToLocator(locatable)
		let context = await this.context
		let element = await locator.find(context)

		if (!element) throw new Error(`Element not found`)

		return context.evaluate(
			(element: HTMLSelectElement, values) => {
				if (element.nodeName.toLowerCase() !== 'select')
					throw new Error('Element is not a <select> element.')

				const options = Array.from(element.options)
				element.value = ''
				for (const option of options) option.selected = values.includes(option.value)
				element.dispatchEvent(new Event('input', { bubbles: true }))
				element.dispatchEvent(new Event('change', { bubbles: true }))
				return options.filter(option => option.selected).map(option => option.value)
			},
			element['element'],
			values,
		)
	}

	@wrapWithCallbacks()
	public async selectByIndex(locatable: Locatable, index: string): Promise<string[]> {
		// TODO: Write tests for this
		let locator = locatableToLocator(locatable)
		let context = await this.context
		let element = await locator.find(context)

		if (!element) throw new ElementNotFound(locatable)

		return context.evaluate(
			(element: HTMLSelectElement, index: number) => {
				if (element.nodeName.toLowerCase() !== 'select')
					throw new Error('Element is not a <select> element.')

				const options = Array.from(element.options)
				element.value = ''
				element.selectedIndex = index

				element.dispatchEvent(new Event('input', { bubbles: true }))
				element.dispatchEvent(new Event('change', { bubbles: true }))
				return options.filter(option => option.selected).map(option => option.value)
			},
			element['element'],
			index,
		)
	}

	@wrapWithCallbacks()
	public async selectByText(locatable: Locatable, text: string): Promise<string[]> {
		let locator = locatableToLocator(locatable)
		let context = await this.context
		let element = await locator.find(context)

		if (!element) throw new ElementNotFound(locatable)

		return context.evaluate(
			(element: HTMLSelectElement, text) => {
				if (element.nodeName.toLowerCase() !== 'select')
					throw new Error('Element is not a <select> element.')

				const options = Array.from(element.options)
				element.value = ''

				for (const option of options)
					option.selected = option.text === text || option.label === text

				element.dispatchEvent(new Event('input', { bubbles: true }))
				element.dispatchEvent(new Event('change', { bubbles: true }))
				return options.filter(option => option.selected).map(option => option.value)
			},
			element['element'],
			text,
		)
	}

	@wrapWithCallbacks()
	public async clear(locatable: Locatable | string): Promise<void> {
		let locator = locatableToLocator(locatable)
		let elements = await locator.findMany(await this.context)
		for (const element of elements) {
			await element.clear()
		}
	}

	@wrapWithCallbacks()
	public async type(
		locatable: Locatable,
		text: string,
		options?: { delay: number },
	): Promise<void> {
		let locator = locatableToLocator(locatable)
		let element = await locator.find(await this.context)
		if (!element) {
			throw new ElementNotFound(locatable.toString())
		}

		await element.focus()
		return this.page.keyboard.type(text, options)
	}

	@wrapWithCallbacks()
	public async press(keyCode: string, options?: { text?: string; delay?: number }): Promise<void> {
		return this.page.keyboard.press(keyCode, options)
	}

	@wrapWithCallbacks()
	public async sendKeys(...keys: string[]): Promise<void> {
		let handle = this.page.keyboard
		for (const key of keys) {
			if (Object.values(Key).includes(key)) {
				await handle.press(key)
			} else {
				await handle.type(key)
			}
		}
	}

	@wrapWithCallbacks()
	public async blur(locatable: Locatable): Promise<void> {
		let locator = locatableToLocator(locatable)
		let element = await locator.find(await this.context)
		if (!element) throw new ElementNotFound(locatable)
		return element.blur()
	}

	@wrapWithCallbacks()
	public async focus(locatable: Locatable): Promise<void> {
		let locator = locatableToLocator(locatable)
		let element = await locator.find(await this.context)
		if (!element) throw new ElementNotFound(locatable)
		return element.focus()
	}

	// @wrapWithCallbacks()
	public async clearBrowserCookies(): Promise<any> {
		const client = await this.page['target']().createCDPSession()
		await client.send('Network.clearBrowserCookies')
	}

	// @wrapWithCallbacks()
	public async clearBrowserCache(): Promise<any> {
		const client = await this.page['target']().createCDPSession()
		await client.send('Network.clearBrowserCache')
	}

	// @wrapWithCallbacks()
	public async emulateDevice(deviceName: string): Promise<void> {
		let device = DeviceDescriptors[deviceName] || CustomDeviceDescriptors[deviceName]
		if (!device) throw new Error(`Unknown device descriptor: ${deviceName}`)
		return this.page.emulate(device)
	}

	// @wrapWithCallbacks()
	public async setUserAgent(userAgent: string): Promise<void> {
		return this.page.setUserAgent(userAgent)
	}

	/**
	 * Takes a screenshot of this element and saves it to the results folder with a random name.
	 */
	// @wrapWithCallbacks()
	public async takeScreenshot(options?: ScreenshotOptions): Promise<void> {
		const path = this.workRoot.join('traces', `${cuid()}.jpg`)

		debugSandboxScreenshot(`Saving screenshot to: ${path}`)
		console.log(`Saving screenshot to: ${path}`)
		await this.page.screenshot({ path, ...options })
		this.screenshots.push(path)

		termImg(path, {
			width: '40%',
			fallback: () => {
				return `Screenshot path: ${path}`
			},
		})
	}

	public async highlightElement(element: ElementHandle): Promise<void> {
		// let session = await this.page.target().createCDPSession()
		// session.send('DOM.highlightNode', { nodeId: element })
		return element.highlight()
	}

	public async findElement(locatable: Locatable): Promise<ElementHandle | null> {
		let locator = locatableToLocator(locatable)
		let context = await this.context
		let element = await locator.find(context)
		if (!element) return null
		element.sandbox = this
		return element
	}

	public async findElements(locatable: Locatable): Promise<ElementHandle[]> {
		let locator = locatableToLocator(locatable)
		let elements = await locator.findMany(await this.context)
		elements.forEach(element => (element.sandbox = this))
		return elements
	}

	public async set(key: string, value: string): Promise<void> {}

	public async get(key: string): Promise<void> {}

	public async extractText(locatable: Locatable): Promise<string> {
		console.warn(`DEPRECATED: Driver.extractText() is deprecated, please use ElementHandle.text()`)
		let locator = locatableToLocator(locatable)
		let element = await locator.find(await this.context)
		if (!element) throw new ElementNotFound(locatable)
		return element.text()
	}

	/**
	 * Switch the focus of the browser to another frame or window
	 */
	public switchTo(): TargetLocator {
		return new TargetLocator(this.page, frame => {
			this.activeFrame = frame
		})
	}

	public async performanceTiming(): Promise<PerformanceTiming> {
		return this.page.evaluate(() => performance.timing.toJSON())
	}

	public async navigationTiming(): Promise<PerformanceTiming> {
		let data = await this.page.evaluate(() => JSON.stringify(window.performance.timing))
		return JSON.parse(data.toString())
	}

	/**
	 * Fetches the paint performance timing entries
	 */
	public async paintTiming(): Promise<PerformanceEntry[]> {
		let data = await this.page.evaluate(() =>
			JSON.stringify(window.performance.getEntriesByType('paint')),
		)
		return JSON.parse(data.toString())
	}

	public async waitForNavigation(): Promise<any> {
		return this.page.waitForNavigation({ waitUntil: 'domcontentloaded' })
	}

	public async interactionTiming(): Promise<number> {
		try {
			let polyfill = readFileSync(
				resolve(join(__dirname, '../extern/tti-polyfill-debug.js')),
				'utf8',
			)
			await this.target.evaluate(polyfill)
			return await this.target.evaluate('window.ttiPolyfill.getFirstConsistentlyInteractive()')
		} catch (e) {
			console.warn('error getting interaction timing:', e)
			return 0
		}
	}

	public async setCacheDisabled(cacheDisabled: boolean = true): Promise<void> {
		const client = await this.page['target']().createCDPSession()
		await client.send('Network.setCacheDisabled', { cacheDisabled })
	}

	public fetchScreenshots() {
		let screenshots = [...this.screenshots]
		this.screenshots = []
		return screenshots
	}
}
