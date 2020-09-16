import { Condition } from '../page/Condition'
import {
	NavigationOptions,
	ClickOptions,
	ExecutionContext,
	Frame,
	Page,
	ScreenshotOptions,
	AuthOptions,
	Viewport,
	EvaluateFn,
} from 'puppeteer'
import DeviceDescriptors from 'puppeteer/DeviceDescriptors'
import { Browser as BrowserInterface } from './IBrowser'
import { NullableLocatable } from './Locatable'
import CustomDeviceDescriptors from '../utils/CustomDeviceDescriptors'
import { ElementHandle } from '../page/types'
import { TargetLocator } from '../page/TargetLocator'
import { PuppeteerClientLike } from '../driver/Puppeteer'
import { WorkRoot } from '../runtime-environment/types'
import KSUID from 'ksuid'
import { Key, KeyDefinitions } from '../page/Enums'
// import termImg from 'term-img'
import { ConcreteTestSettings, DEFAULT_WAIT_TIMEOUT_MILLISECONDS } from './Settings'
import { NetworkErrorData, ActionErrorData } from './errors/Types'
import { StructuredError } from '../utils/StructuredError'
import debugFactory from 'debug'
import Mouse from '../page/Mouse'
import { rewriteError } from './decorators/rewriteError'
import { addCallbacks } from './decorators/addCallbacks'
import { autoWaitUntil } from './decorators/autoWait'
import { locatableToLocator, toLocatorError } from './toLocatorError'
import { Keyboard } from '../page/Keyboard'
import ms from 'ms'
import { getFrames } from '../utils/frames'

export const debug = debugFactory('element:runtime:browser')
const debugScreenshot = debugFactory('element:runtime:browser:screenshot')

export class Browser<T> implements BrowserInterface {
	public screenshots: string[]
	customContext: T

	private newPageCallback: (resolve: (page: Page) => void) => void
	private newPagePromise: Promise<Page>

	constructor(
		public workRoot: WorkRoot,
		private client: PuppeteerClientLike,
		public settings: ConcreteTestSettings,
		public beforeFunc: (b: Browser<T>, name: string) => Promise<void> = async () => undefined,
		public afterFunc: (b: Browser<T>, name: string) => Promise<void> = async () => undefined,
		private activeFrame?: Frame | null,
	) {
		this.beforeFunc && this.afterFunc
		this.screenshots = []

		this.newPageCallback = resolve => {
			this.client.browser.once('targetcreated', async target => {
				if (target.type() === 'page') {
					const newPage = await target.page()
					this.client.page = newPage
					await newPage.bringToFront()
					resolve(newPage)
				} else {
					this.newPagePromise = new Promise(resolve => {
						this.newPageCallback(resolve)
					})
				}
			})
		}

		this.newPagePromise = new Promise(resolve => {
			this.newPageCallback(resolve)
		})
	}

	private get context(): Promise<ExecutionContext> {
		// Promise.resolve is a quick fix for TS until the types are updated
		return Promise.resolve(this.target.executionContext())
	}

	public testData(name: string): string {
		return this.workRoot.testData(name)
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

	public get pages(): Promise<Page[]> {
		return this.client.browser.pages()
	}

	public get frames(): Frame[] {
		return getFrames(this.page.frames())
	}

	public get mouse() {
		return new Mouse(this.page)
	}

	public get keyboard() {
		return new Keyboard(this.page)
	}

	/**
	 * Returns the URL of the current frame/page
	 */
	public get url(): string {
		return this.page.url()
	}

	private getKeyCode(key: string): string {
		const lowerKey = key.toLowerCase()
		//if key = `KeyA` or function key likes `CONTROL`, just return this key
		if (lowerKey.includes('key') || Object.values(Key).includes(key)) {
			return key
		}
		//now to process to get the key code
		for (const key in KeyDefinitions) {
			const keyObj = KeyDefinitions[key]
			if (lowerKey === keyObj.key) {
				return keyObj.code
			}
		}
		return ''
	}

	@rewriteError()
	public title(): Promise<string> {
		return this.page.title()
	}

	@rewriteError()
	public async evaluate(fn: EvaluateFn, ...args: any[]): Promise<any> {
		return this.target.evaluate(fn, ...args)
	}

	@rewriteError()
	public async authenticate(username?: string, password?: string): Promise<void> {
		let authOptions: AuthOptions | null = null
		if (username !== undefined && password !== undefined) {
			authOptions = { username, password }
		}
		await this.page.authenticate(authOptions)
	}

	@addCallbacks()
	public async wait(timeoutOrCondition: Condition | number | string): Promise<any> {
		if (typeof timeoutOrCondition === 'string') {
			await new Promise(yeah => setTimeout(yeah, ms(timeoutOrCondition)))
			return true
		} else if (typeof timeoutOrCondition === 'number') {
			let convertedTimeout = timeoutOrCondition
			if (convertedTimeout < 0) convertedTimeout = DEFAULT_WAIT_TIMEOUT_MILLISECONDS
			else if (convertedTimeout < 1e3) convertedTimeout *= 1e3
			await new Promise(yeah => setTimeout(yeah, convertedTimeout))
			return true
		}

		debug('wait')
		try {
			const condition: Condition = timeoutOrCondition
			condition.settings = this.settings
			if (condition.hasWaitFor) {
				return await condition.waitFor(this.target, this.page)
			} else {
				return await condition.waitForEvent(this.page)
			}
		} catch (err) {
			debug('wait timed out')
			throw new StructuredError<ActionErrorData>(
				'wait timed out',
				{
					_kind: 'action',
					kind: 'wait-timeout',
					action: 'wait',
				},
				err,
			)
		}
	}

	@addCallbacks()
	public async visit(url: string, options: NavigationOptions = {}): Promise<any> {
		try {
			return this.page.goto(url, {
				timeout: Number(this.settings.waitTimeout),
				waitUntil: ['load', 'domcontentloaded', 'networkidle0', 'networkidle2'],
				...options,
			})
		} catch (e) {
			let finalErr = e
			if (e.message.includes('net::ERR_NAME_NOT_RESOLVED')) {
				finalErr = new StructuredError<NetworkErrorData>(
					'domain name not resolved',
					{
						_kind: 'net',
						url,
						kind: 'net',
						subKind: 'not-resolved',
					},
					e,
				)
			}
			if (e.message.includes('Navigation Timeout Exceeded')) {
				finalErr = new StructuredError<NetworkErrorData>(
					'navigation timed out',
					{
						_kind: 'net',
						url,
						kind: 'net',
						subKind: 'navigation-timeout',
					},
					e,
				)
			}
			throw finalErr
		}
	}

	/**
	 * Sends a click event to the element located at `selector`. If the element is
	 * currently outside the viewport it will first scroll to that element.
	 */
	@autoWaitUntil()
	@addCallbacks()
	public async click(selectorOrLocator: NullableLocatable, options?: ClickOptions): Promise<void> {
		const element = await this.findElement(selectorOrLocator)
		return element.click(options)
	}

	/**
	 * Sends a double-click event to the element located by the supplied Locator or `selector`. If the element is
	 * currently outside the viewport it will first scroll to that element.
	 */
	@autoWaitUntil()
	@addCallbacks()
	public async doubleClick(
		selectorOrLocator: NullableLocatable,
		options?: ClickOptions,
	): Promise<void> {
		const element = await this.findElement(selectorOrLocator)
		return element.click({ clickCount: 2, ...options })
	}

	@autoWaitUntil()
	@addCallbacks()
	public async selectByValue(locatable: NullableLocatable, ...values: string[]): Promise<string[]> {
		const element = await this.findElement(locatable)
		const context = await this.context

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
			element.element,
			values,
		)
	}

	@autoWaitUntil()
	@addCallbacks()
	public async selectByIndex(locatable: NullableLocatable, index: string): Promise<string[]> {
		// TODO: Write tests for this
		const element = await this.findElement(locatable)
		const context = await this.context

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
			element.element,
			index,
		)
	}

	@autoWaitUntil()
	@addCallbacks()
	public async selectByText(locatable: NullableLocatable, text: string): Promise<string[]> {
		const element = await this.findElement(locatable)
		const context = await this.context

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
			element.element,
			text,
		)
	}

	@autoWaitUntil()
	@addCallbacks()
	public async clear(locatable: NullableLocatable | string): Promise<void> {
		const locator = locatableToLocator(locatable, 'browser.clear()')
		const elements = await locator.findMany(await this.context)
		for (const element of elements) {
			await element.clear()
		}
	}

	@autoWaitUntil()
	@addCallbacks()
	public async type(
		locatable: NullableLocatable,
		text: string,
		options?: { delay: number },
	): Promise<void> {
		const element = await this.findElement(locatable)

		await element.focus()
		return this.page.keyboard.type(text, options)
	}

	@addCallbacks()
	public async press(keyCode: string, options?: { text?: string; delay?: number }): Promise<void> {
		return this.page.keyboard.press(keyCode, options)
	}

	@addCallbacks()
	public async sendKeys(...keys: string[]): Promise<void> {
		const handle = this.page.keyboard
		for (const key of keys) {
			if (Object.values(Key).includes(key)) {
				await handle.press(key)
			} else {
				await handle.type(key)
			}
		}
	}

	@addCallbacks()
	public async sendKeyCombinations(...keys: string[]): Promise<void> {
		const handle = this.page.keyboard
		for (const key of keys) {
			const keyCode = this.getKeyCode(key)
			await handle.down(keyCode)
		}
		for (const key of keys.reverse()) {
			const keyCode = this.getKeyCode(key)
			await handle.up(keyCode)
		}
	}

	@autoWaitUntil()
	@addCallbacks()
	public async blur(locatable: NullableLocatable): Promise<void> {
		const element = await this.findElement(locatable)
		return element.blur()
	}

	@autoWaitUntil()
	@addCallbacks()
	public async focus(locatable: NullableLocatable): Promise<void> {
		const element = await this.findElement(locatable)
		return element.focus()
	}

	@rewriteError()
	public async clearBrowserCookies(): Promise<any> {
		const client = await this.page['target']().createCDPSession()
		await client.send('Network.clearBrowserCookies')
	}

	@rewriteError()
	public async clearBrowserCache(): Promise<any> {
		const client = await this.page['target']().createCDPSession()
		await client.send('Network.clearBrowserCache')
	}

	@rewriteError()
	public async emulateDevice(deviceName: string): Promise<void> {
		const device = DeviceDescriptors[deviceName] || CustomDeviceDescriptors[deviceName]
		if (!device) throw new Error(`Unknown device descriptor: ${deviceName}`)
		return this.page.emulate(device)
	}

	@rewriteError()
	public async setUserAgent(userAgent: string): Promise<void> {
		return this.page.setUserAgent(userAgent)
	}

	@rewriteError()
	public async setViewport(viewport: Viewport): Promise<void> {
		return this.page.setViewport(viewport)
	}

	@rewriteError()
	public async setExtraHTTPHeaders(headers: { [key: string]: string }): Promise<void> {
		if (Object.keys(headers).length) return this.page.setExtraHTTPHeaders(headers)
	}

	/**
	 * Takes a screenshot of this element and saves it to the results folder with a random name.
	 */
	@rewriteError()
	public async takeScreenshot(options?: ScreenshotOptions): Promise<void> {
		await this.saveScreenshot(async path => {
			await this.page.screenshot({ path, ...options })
			return true
		})
	}

	@autoWaitUntil()
	@rewriteError()
	public async highlightElement(element: ElementHandle): Promise<void> {
		// let session = await this.page.target().createCDPSession()
		// session.send('DOM.highlightNode', { nodeId: element })
		return element.highlight()
	}

	@autoWaitUntil()
	@rewriteError()
	public async findElement(locatable: NullableLocatable): Promise<ElementHandle> {
		const locator = locatableToLocator(locatable, 'browser.findElement(locatable)')

		debug('locator %o', locator)

		const maybeElement = await locator.find(await this.context)
		if (!maybeElement) {
			throw toLocatorError(locatable, 'browser.findElement()')
		}
		const element = maybeElement as ElementHandle

		element.bindBrowser(this)

		return element
	}

	public async maybeFindElement(locatable: NullableLocatable): Promise<ElementHandle | null> {
		if (locatable === null) {
			return null
		}

		const locator = locatableToLocator(locatable, 'browser.maybeFindElement(locatable)')
		const context = await this.context
		const maybeElement = await locator.find(context)
		if (!maybeElement) return null

		const element = maybeElement as ElementHandle

		element.bindBrowser(this)
		return element
	}

	@autoWaitUntil()
	@rewriteError()
	public async findElements(locatable: NullableLocatable): Promise<ElementHandle[]> {
		const locator = locatableToLocator(locatable, 'browser.findElements(locatable)')
		const elements = await locator.findMany(await this.context)
		elements.forEach(element => element.bindBrowser(this))
		return elements
	}

	/**
	 * Switch the focus of the browser to another frame or window
	 */
	public switchTo(): TargetLocator {
		return new TargetLocator(
			this.page,
			frame => {
				this.activeFrame = frame
			},
			page => this.switchPage(page),
		)
	}

	public async performanceTiming(): Promise<PerformanceTiming> {
		return this.page.evaluate(() => performance.timing.toJSON())
	}

	public async navigationTiming(): Promise<PerformanceTiming> {
		const data = await this.page.evaluate(() => JSON.stringify(window.performance.timing))
		return JSON.parse(data.toString())
	}

	/**
	 * Fetches the paint performance timing entries
	 */
	public async paintTiming(): Promise<PerformanceEntry[]> {
		const data = await this.page.evaluate(() =>
			JSON.stringify(window.performance.getEntriesByType('paint')),
		)
		return JSON.parse(data.toString())
	}

	public async waitForNavigation(): Promise<any> {
		return this.page.waitForNavigation({ waitUntil: 'domcontentloaded' })
	}

	// TODO fix this
	public async interactionTiming(): Promise<number> {
		// try {
		// 	let polyfill = readFileSync(
		// 		resolve(join(__dirname, '../extern/tti-polyfill-debug.js')),
		// 		'utf8',
		// 	)
		// 	await this.target.evaluate(polyfill)
		// 	return await this.target.evaluate('window.ttiPolyfill.getFirstConsistentlyInteractive()')
		// } catch (e) {
		// 	console.warn('error getting interaction timing:', e)
		// 	return 0
		// }
		return 0
	}

	public async setCacheDisabled(cacheDisabled = true): Promise<void> {
		const client = await this.page['target']().createCDPSession()
		await client.send('Network.setCacheDisabled', { cacheDisabled })
	}

	public fetchScreenshots() {
		const screenshots = [...this.screenshots]
		this.screenshots = []
		return screenshots
	}

	public async saveScreenshot(fn: (path: string) => Promise<boolean>): Promise<void> {
		const fileId = KSUID.randomSync().string

		const path = this.workRoot.join('screenshots', `${fileId}.jpg`)
		debugScreenshot(`Saving screenshot to: ${path}`)

		if (await fn(path)) {
			this.screenshots.push(path)
			debugScreenshot(`Saved screenshot to: ${path}`)

			// termImg(path, {
			// 	width: '40%',
			// 	fallback: () => {
			// 		return `Screenshot path: ${path}`
			// 	},
			// })
		}
	}

	private async switchPage(page: Page | number): Promise<void> {
		if (typeof page === 'number') {
			this.client.page = (await this.pages)[page]
		} else {
			this.client.page = page
		}
		await this.client.page.bringToFront()
	}

	public async waitForNewPage(): Promise<Page> {
		const newPage = await this.newPagePromise

		// wait for another page to be opened
		this.newPagePromise = new Promise(resolve => {
			this.newPageCallback(resolve)
		})

		return newPage
	}

	public async close(): Promise<void> {
		await this.client.browser.close()
	}
}
