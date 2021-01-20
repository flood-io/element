import {
	Frame,
	Page,
	ViewportSize,
	ChromiumBrowserContext,
	BrowserContext,
	HTTPCredentials,
	Cookie,
} from 'playwright'
import debugFactory from 'debug'
import ms from 'ms'
import { Condition } from '../page/Condition'
import { Browser as BrowserInterface } from '../interface/IBrowser'
import { NullableLocatable } from './Locatable'
import {
	ElementHandle,
	NavigationOptions,
	ScreenshotOptions,
	EvaluateFn,
	ClickOptions,
	BrowserType,
	CookiesFilterParams,
	Locator,
	ScrollDirection,
} from '../page/types'
import { TargetLocator } from '../page/TargetLocator'
import { PlaywrightClientLike } from '../driver/Playwright'
import { WorkRoot } from '../runtime-environment/types'
import { Key, KeyDefinitions } from '../page/Enums'
import { ConcreteTestSettings, DEFAULT_WAIT_TIMEOUT_MILLISECONDS } from './Settings'
import { NetworkErrorData, ActionErrorData } from './errors/Types'
import { StructuredError } from '../utils/StructuredError'
import Mouse from '../page/Mouse'
import { addCallbacks } from './decorators/addCallbacks'
import { autoWaitUntil } from './decorators/autoWait'
import { locatableToLocator, toLocatorError } from './toLocatorError'
import { Keyboard } from '../page/Keyboard'
import { getFrames } from '../utils/frames'
import { DeviceDescriptor } from '../page/Device'
import chalk from 'chalk'
import { Point } from '../page/Point'
import { isAnElementHandle, isLocator, isPoint } from '../utils/CheckInstance'

export const debug = debugFactory('element:runtime:browser')

export class Browser<T> implements BrowserInterface {
	public screenshots: string[]
	customContext: T

	private newPageCallback: (resolve: (page: Page) => void) => void
	private newPagePromise: Promise<Page>

	constructor(
		public workRoot: WorkRoot,
		private client: PlaywrightClientLike,
		public settings: ConcreteTestSettings,
		public beforeFunc: (browser: Browser<T>, name: string) => Promise<void> = async () => undefined,
		public afterFunc: (browser: Browser<T>, name: string) => Promise<void> = async () => undefined,
		private activeFrame?: Frame | null,
	) {
		this.beforeFunc && this.afterFunc
		this.screenshots = []

		this.newPageCallback = resolve => {
			this.client.page.context().on('page', async newPage => {
				this.client.page = newPage
				resolve(newPage)
			})
		}

		this.newPagePromise = new Promise(resolve => {
			this.newPageCallback(resolve)
		})
	}

	public context(): BrowserContext {
		return this.page.context()
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

	public get browser(): BrowserType {
		return this.settings.browser
	}

	public get page(): Page {
		return this.client.page
	}

	public get pages(): Page[] {
		return this.client.page.context().pages()
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

	@addCallbacks()
	public title(): Promise<string> {
		return this.page.title()
	}

	@addCallbacks()
	public async evaluate(fn: EvaluateFn, ...args: any[]): Promise<any> {
		return this.evaluateWithoutDecorator(fn, ...args)
	}

	@addCallbacks()
	public async authenticate(username?: string, password?: string): Promise<void> {
		let authOptions: HTTPCredentials | null = null
		if (username !== undefined && password !== undefined) {
			authOptions = { username, password }
		}
		await this.page.context().setHTTPCredentials(authOptions)
	}

	@addCallbacks()
	public async wait(timeoutOrCondition: Condition | number | string): Promise<any> {
		await this.waitWithoutDecorator(timeoutOrCondition)
	}

	@addCallbacks()
	public async visit(url: string, options: NavigationOptions = {}): Promise<any> {
		try {
			return this.page.goto(url, {
				timeout: Number(this.settings.waitTimeout),
				waitUntil: 'load',
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
		const element = await this.findElementWithoutDecorator(selectorOrLocator)
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
		const element = await this.findElementWithoutDecorator(selectorOrLocator)
		return element.click({ clickCount: 2, ...options })
	}

	@autoWaitUntil()
	@addCallbacks()
	public async selectByValue(locatable: NullableLocatable, ...values: string[]): Promise<string[]> {
		const element = await this.findElementWithoutDecorator(locatable)

		return this.evaluateWithoutDecorator(
			(args: any[]) => {
				const [element, values] = args as [HTMLSelectElement, any]

				if (element.nodeName.toLowerCase() !== 'select')
					throw new Error('Element is not a <select> element.')

				const options = Array.from(element.options)
				element.value = ''
				for (const option of options) option.selected = values.includes(option.value)
				element.dispatchEvent(new Event('input', { bubbles: true }))
				element.dispatchEvent(new Event('change', { bubbles: true }))
				return options.filter(option => option.selected).map(option => option.value)
			},
			[element.element, values],
		)
	}

	@autoWaitUntil()
	@addCallbacks()
	public async selectByIndex(locatable: NullableLocatable, index: string): Promise<string[]> {
		// TODO: Write tests for this
		const element = await this.findElementWithoutDecorator(locatable)

		return this.evaluateWithoutDecorator(
			(args: any[]) => {
				const [element, index] = args as [HTMLSelectElement, number]
				if (element.nodeName.toLowerCase() !== 'select')
					throw new Error('Element is not a <select> element.')

				const options = Array.from(element.options)
				element.value = ''
				element.selectedIndex = index

				element.dispatchEvent(new Event('input', { bubbles: true }))
				element.dispatchEvent(new Event('change', { bubbles: true }))
				return options.filter(option => option.selected).map(option => option.value)
			},
			[element.element, index],
		)
	}

	@autoWaitUntil()
	@addCallbacks()
	public async selectByText(locatable: NullableLocatable, text: string): Promise<string[]> {
		const element = await this.findElementWithoutDecorator(locatable)

		return this.evaluateWithoutDecorator(
			(args: any[]) => {
				const [element, text] = args as [HTMLSelectElement, string]
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
			[element.element, text],
		)
	}

	@autoWaitUntil()
	@addCallbacks()
	public async clear(locatable: NullableLocatable | string): Promise<void> {
		const locator = locatableToLocator(locatable, 'browser.clear()')
		const elements = await locator.findMany(this.page, undefined, this.target)
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
		const element = await this.findElementWithoutDecorator(locatable)

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
		const element = await this.findElementWithoutDecorator(locatable)
		return element.blur()
	}

	@autoWaitUntil()
	@addCallbacks()
	public async focus(locatable: NullableLocatable): Promise<void> {
		const element = await this.findElementWithoutDecorator(locatable)
		return element.focus()
	}

	@addCallbacks()
	public async clearBrowserCookies(): Promise<any> {
		await this.page.context().clearCookies()
	}

	@addCallbacks()
	public async clearBrowserCache(): Promise<any> {
		if (this.browser === 'chromium') {
			const context = (await this.page.context()) as ChromiumBrowserContext
			const client = await context.newCDPSession(this.page)
			await client.send('Network.clearBrowserCache')
		} else {
			/**
			 * NOTES
			 * need to implement clear cache for firefox and safari
			 */
			console.log('Not Implemented')
		}
	}

	@addCallbacks()
	public async emulateDevice(device: DeviceDescriptor): Promise<void> {
		await this.client.closePages()
		const context = await this.client.browser.newContext({
			...device,
		})
		this.client.page = await context.newPage()
	}

	@addCallbacks()
	public async setUserAgent(userAgent: string): Promise<void> {
		if (!this.client.isFirstRun()) {
			await this.client.closePages()
			this.client.page = await this.client.browser.newPage({ userAgent })
		}
	}

	@addCallbacks()
	public async setViewport(viewport: ViewportSize): Promise<void> {
		return this.page.setViewportSize(viewport)
	}

	@addCallbacks()
	public async setExtraHTTPHeaders(headers: { [key: string]: string }): Promise<void> {
		if (Object.keys(headers).length) return this.page.setExtraHTTPHeaders(headers)
	}

	/**
	 * Takes a screenshot of this element and saves it to the results folder with a random name.
	 */
	@addCallbacks()
	public async takeScreenshot(options?: ScreenshotOptions): Promise<void> {
		await this.saveScreenshot(async path => {
			await this.page.screenshot({ path, ...options })
			console.log(chalk.grey(`Screenshot saved in ${path}`))
			return true
		})
	}

	@autoWaitUntil()
	@addCallbacks()
	public async highlightElement(element: ElementHandle): Promise<void> {
		return element.highlight()
	}

	@autoWaitUntil()
	@addCallbacks()
	public async findElement(locatable: NullableLocatable): Promise<ElementHandle> {
		return this.findElementWithoutDecorator(locatable)
	}

	public async maybeFindElement(locatable: NullableLocatable): Promise<ElementHandle | null> {
		if (locatable === null) {
			return null
		}

		const locator = locatableToLocator(locatable, 'browser.maybeFindElement(locatable)')
		const maybeElement = await locator.find(this.page, undefined, this.target)
		if (!maybeElement) return null

		const element = maybeElement as ElementHandle

		element.bindBrowser(this)
		return element
	}

	@autoWaitUntil()
	@addCallbacks()
	public async findElements(locatable: NullableLocatable): Promise<ElementHandle[]> {
		const locator = locatableToLocator(locatable, 'browser.findElements(locatable)')
		const elements = await locator.findMany(this.page, undefined, this.target)
		elements.forEach(element => element.bindBrowser(this))
		return elements
	}

	/**
	 * Switch the focus of the browser to another frame or window
	 */
	public switchTo(): TargetLocator {
		return new TargetLocator(
			this.page,
			this.target,
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
		/**
		 * NOTES
		 * handle CDPSession
		 */
		if (this.browser === 'chromium') {
			const client = await (this.page.context() as ChromiumBrowserContext).newCDPSession(this.page)
			await client.send('Network.setCacheDisabled', { cacheDisabled })
		} else {
			console.warn('This kind of browser does not support CDPSession')
		}
	}

	public fetchScreenshots() {
		const screenshots = [...this.screenshots]
		this.screenshots = []
		return screenshots
	}

	public async saveScreenshot(fn: (path: string) => Promise<boolean>): Promise<void> {
		const fileId = `${this.workRoot.getSubRoot('test-script')}_${this.screenshots.length + 1}`
		const path = this.workRoot.join('screenshots', `${fileId}.jpg`)

		if (await fn(path)) {
			this.screenshots.push(path)
		}
	}

	private async switchPage(page: Page | number): Promise<void> {
		if (typeof page === 'number') {
			this.client.page = this.pages[page]
		} else {
			this.client.page = page
		}
		/**
		 * NOTES
		 * playwright does not have method bringtoFront()
		 */
		// await this.client.page.bringToFront()
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

	@addCallbacks()
	public async getCookies(filterBy?: CookiesFilterParams): Promise<Cookie[]> {
		const urls = filterBy?.urls
		const names = filterBy?.names
		let cookies = await this.page.context().cookies(urls)
		if (names) {
			cookies = cookies.filter(cookie =>
				typeof names === 'string' ? cookie.name === names : names.includes(cookie.name),
			)
		}
		return cookies
	}

	public getUrl(): string {
		return this.page.url()
	}

	private isCorrectScrollBehavior(behavior: string): behavior is ScrollBehavior {
		return ['auto', 'smooth'].includes(behavior)
	}

	@addCallbacks()
	public async scrollBy(
		x: number | 'window.innerWidth',
		y: number | 'window.innerHeight',
		scrollOptions?: ScrollOptions,
	): Promise<void> {
		const behavior = scrollOptions?.behavior ?? 'auto'

		if (!this.isCorrectScrollBehavior(behavior)) {
			throw new Error('The input behavior is not correct (Must be "auto" or "smooth").')
		}

		if (x !== 'window.innerWidth' && typeof x !== 'number') {
			throw new Error(
				'The input x that you want to scroll by must be "window.innerWidth" or a number.',
			)
		}

		if (y !== 'window.innerHeight' && typeof y !== 'number') {
			throw new Error(
				'The input y that you want to scroll by must be "window.innerHeight" or a number.',
			)
		}

		await this.page.evaluate(
			({ x, y, behavior }) => {
				window.scrollBy({
					top: y === 'window.innerHeight' ? window.innerHeight : y,
					left: x === 'window.innerWidth' ? window.innerWidth : x,
					behavior,
				})
			},
			{ x, y, behavior },
		)
	}

	@addCallbacks()
	public async scrollTo(
		target: Locator | ElementHandle | Point | ScrollDirection,
		scrollOptions?: ScrollIntoViewOptions,
	): Promise<void> {
		const behavior = scrollOptions?.behavior ?? 'auto'

		if (!this.isCorrectScrollBehavior(behavior)) {
			throw new Error('The input behavior is not correct (Must be "auto" or "smooth").')
		}

		const block = scrollOptions?.block ?? 'start'
		const inline = scrollOptions?.inline ?? 'nearest'

		let top = 0
		let left = 0
		const [_scrollHeight, _currentTop, _scrollWidth] = await this.page.evaluate(() => [
			document.body.scrollHeight,
			window.pageYOffset || document.documentElement.scrollTop,
			document.body.scrollWidth,
		])

		if (
			(isLocator(target) || isAnElementHandle(target)) &&
			!isPoint(target) &&
			typeof target !== 'string'
		) {
			const targetEl: ElementHandle = isLocator(target)
				? await this.findElementWithoutDecorator(target)
				: target
			await targetEl.element.evaluate(
				(elementNode, scrollOptions) => {
					const element = elementNode as HTMLElement
					element.scrollIntoView(scrollOptions)
				},
				{ behavior, block, inline },
			)
			return
		}

		if (isPoint(target)) {
			[left, top] = target
		} else if (typeof target === 'string') {
			switch (target) {
				case 'top':
					top = 0
					left = 0
					break
				case 'bottom':
					top = _scrollHeight
					left = 0
					break
				case 'left':
					top = _currentTop
					left = 0
					break
				case 'right':
					top = _currentTop
					left = _scrollWidth
					break
				default:
					throw new Error(
						'The input target is not a Locator or an ElementHandle or a Point or a Scroll Direction.',
					)
			}
		} else {
			throw new Error(
				'The input target is not a Locator or an ElementHandle or a Point or a Scroll Direction.',
			)
		}

		await this.page.evaluate(
			({ top, left, behavior }) => {
				window.scrollTo({ top, left, behavior })
			},
			{ top, left, behavior },
		)
	}

	private async evaluateWithoutDecorator(fn: EvaluateFn, ...args: any[]): Promise<any> {
		return this.target.evaluate(fn, ...args)
	}

	private async findElementWithoutDecorator(locatable: NullableLocatable): Promise<ElementHandle> {
		const locator = locatableToLocator(locatable, 'browser.findElement(locatable)')
		debug('locator %o', locator)

		const maybeElement = await locator.find(this.page, undefined, this.target)
		if (!maybeElement) {
			throw toLocatorError(locatable, 'browser.findElement()')
		}
		const element = maybeElement as ElementHandle
		element.bindBrowser(this)

		return element
	}

	private async waitWithoutDecorator(
		timeoutOrCondition: Condition | number | string,
	): Promise<any> {
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
}
