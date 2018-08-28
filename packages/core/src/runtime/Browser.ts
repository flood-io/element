import { Condition } from '../page/Condition'
import {
	NavigationOptions,
	ClickOptions,
	ExecutionContext,
	Frame,
	Page,
	ScreenshotOptions,
	AuthOptions,
} from 'puppeteer'
import { Browser as BrowserInterface, NullableLocatable, EvaluateFn } from './types'
import * as DeviceDescriptors from 'puppeteer/DeviceDescriptors'
import CustomDeviceDescriptors from '../utils/CustomDeviceDescriptors'
import { Locator, ElementHandle } from '../page/types'
import { TargetLocator } from '../page/TargetLocator'
import { By } from '../page/By'
import { PuppeteerClient } from '../types'
import { WorkRoot } from '../runtime-environment/types'
import { join, resolve } from 'path'
import * as cuid from 'cuid'
import { Key } from '../page/Enums'
import { readFileSync } from 'fs'
import * as termImg from 'term-img'
import { ConcreteTestSettings } from './Settings'
import { NetworkErrorData, LocatorErrorData } from './errors/Types'
import { StructuredError } from '../utils/StructuredError'

import * as debugFactory from 'debug'
const debug = debugFactory('element:runtime:browser')
const debugScreenshot = debugFactory('element:runtime:browser:screenshot')

function toLocatorError(
	locatable: NullableLocatable,
	callContext: string,
): StructuredError<LocatorErrorData> {
	let locatorString: string
	if (locatable === null) {
		locatorString = 'null locator'
	} else if (typeof locatable === 'string') {
		locatorString = locatable
	} else {
		locatorString = locatable.toErrorString()
	}

	return new StructuredError<LocatorErrorData>(
		`No element was found on the page using '${locatorString}'`,
		{
			_kind: 'locator',
			kind: 'element-not-found',
			locator: locatorString,
		},
		undefined,
		'browser',
		callContext,
	)
}

export function locatableToLocator(el: NullableLocatable, callCtx: string): Locator | never {
	if (el === null) {
		throw toLocatorError(el, callCtx)
	} else if (typeof el === 'string') {
		return By.css(el)
	} else {
		// TODO proerly handle ElementHandle here...
		return el as Locator
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

/**
 * Defines a Function Decorator which wraps a method with class local before and after
 */
function addCallbacks<T>() {
	return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
		let originalFn = descriptor.value

		descriptor.value = async function(...args: any[]) {
			let ret
			const browser: Browser<T> = this

			// capture the stack trace at call-time
			const calltimeError = new Error()
			Error.captureStackTrace(calltimeError)
			const calltimeStack = calltimeError.stack

			if (browser.beforeFunc instanceof Function) await browser.beforeFunc(browser, propertyKey)

			try {
				ret = await originalFn.apply(browser, args)
			} catch (e) {
				debug('addCallbacks lifting to StructuredError', propertyKey, e)

				const sErr = StructuredError.liftWithSource(e, 'browser', `browser.${propertyKey}`)
				sErr.stack = calltimeStack

				debug('error now', sErr)

				throw sErr
			}
			if (browser.afterFunc instanceof Function) await browser.afterFunc(browser, propertyKey)
			return ret
		}

		return descriptor
	}
}

function rewriteError<T>() {
	return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
		let originalFn = descriptor.value

		descriptor.value = async function(...args: any[]) {
			let ret
			const browser: Browser<T> = this

			// capture the stack trace at call-time
			const calltimeError = new Error()
			Error.captureStackTrace(calltimeError)
			const calltimeStack = calltimeError.stack

			try {
				ret = await originalFn.apply(browser, args)
			} catch (e) {
				debug('rewriteError lifting to StructuredError', propertyKey, e)

				const sErr = StructuredError.liftWithSource(e, 'browser', `browser.${propertyKey}`)
				sErr.stack = calltimeStack

				debug('error now', sErr)

				throw sErr
			}
			return ret
		}

		return descriptor
	}
}

export class Browser<T> implements BrowserInterface {
	public screenshots: string[]
	customContext: T

	constructor(
		public workRoot: WorkRoot,
		private client: PuppeteerClient,
		public settings: ConcreteTestSettings,
		public beforeFunc: (b: Browser<T>, name: string) => Promise<void> = async () => {},
		public afterFunc: (b: Browser<T>, name: string) => Promise<void> = async () => {},
		private activeFrame?: Frame | null,
	) {
		this.beforeFunc && this.afterFunc
		this.screenshots = []

		// this.page.on('console', msg => console.log(msg))
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
		let authOptions: AuthOptions | null = null
		if (username !== undefined && password !== undefined) {
			authOptions = { username, password }
		}
		await this.page.authenticate(authOptions)
	}

	@addCallbacks()
	public async wait(timeoutOrCondition: Condition | number): Promise<boolean> {
		if (typeof timeoutOrCondition === 'number') {
			await new Promise((yeah, nah) => setTimeout(yeah, Number(timeoutOrCondition) * 1e3))
			return true
		}
		debug('wait')
		let condition = timeoutOrCondition as Condition
		condition.settings = this.settings
		if (condition.hasWaitFor) {
			return condition.waitFor(this.target, this.page)
		} else {
			return condition.waitForEvent(this.page)
		}
	}

	@addCallbacks()
	public async visit(url: string, options: NavigationOptions = {}): Promise<void> {
		let timeout = this.settings.waitTimeout * 1e3
		let response
		try {
			response = await this.page.goto(url, {
				timeout,
				waitUntil: 'domcontentloaded',
				...options,
			})
		} catch (e) {
			if (e.message.includes('net::ERR_NAME_NOT_RESOLVED')) {
				e = new StructuredError<NetworkErrorData>(
					'dns name not resolved',
					{
						_kind: 'net',
						url,
						kind: 'net',
						subKind: 'not-resolved',
					},
					e,
				)
			}
			throw e
		}

		if (response === null) {
			throw new StructuredError<NetworkErrorData>('no response', {
				url,
				_kind: 'net',
				kind: 'http',
				subKind: 'no-response',
			})
		}

		// response needs to be 2xx or 3xx
		// TODO make configurable
		const status = response.status()
		if (!response.ok() && !(status >= 300 && status <= 399)) {
			throw new StructuredError<NetworkErrorData>('http response code not OK', {
				url,
				_kind: 'net',
				kind: 'http',
				subKind: 'not-ok',
				code: response.status().toString(),
			})
		}

		return
	}

	/**
	 * Sends a click event to the element located at `selector`. If the element is
	 * currently outside the viewport it will first scroll to that element.
	 */
	@addCallbacks()
	public async click(selectorOrLocator: NullableLocatable, options?: ClickOptions): Promise<void> {
		const element = await this.findElement(selectorOrLocator)
		return element.click(options)
	}

	/**
	 * Sends a double-click event to the element located by the supplied Locator or `selector`. If the element is
	 * currently outside the viewport it will first scroll to that element.
	 */
	@addCallbacks()
	public async doubleClick(
		selectorOrLocator: NullableLocatable,
		options?: ClickOptions,
	): Promise<void> {
		const element = await this.findElement(selectorOrLocator)
		return element.click({ clickCount: 2, ...options })
	}

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
			element['element'],
			values,
		)
	}

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
			element['element'],
			index,
		)
	}

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
			element['element'],
			text,
		)
	}

	@addCallbacks()
	public async clear(locatable: NullableLocatable | string): Promise<void> {
		let locator = locatableToLocator(locatable, 'browser.clear()')
		let elements = await locator.findMany(await this.context)
		for (const element of elements) {
			await element.clear()
		}
	}

	@addCallbacks()
	public async type(
		locatable: NullableLocatable,
		text: string,
		options?: { delay: number },
	): Promise<void> {
		let element = await this.findElement(locatable)

		await element.focus()
		return this.page.keyboard.type(text, options)
	}

	@addCallbacks()
	public async press(keyCode: string, options?: { text?: string; delay?: number }): Promise<void> {
		return this.page.keyboard.press(keyCode, options)
	}

	@addCallbacks()
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

	@addCallbacks()
	public async blur(locatable: NullableLocatable): Promise<void> {
		const element = await this.findElement(locatable)
		return element.blur()
	}

	@addCallbacks()
	public async focus(locatable: NullableLocatable): Promise<void> {
		const element = await this.findElement(locatable)
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
		this.saveScreenshot(async path => {
			await this.page.screenshot({ path, ...options })
			return true
		})
	}

	public async highlightElement(element: ElementHandle): Promise<void> {
		// let session = await this.page.target().createCDPSession()
		// session.send('DOM.highlightNode', { nodeId: element })
		return element.highlight()
	}

	@rewriteError()
	public async findElement(locatable: NullableLocatable): Promise<ElementHandle> {
		let locator = locatableToLocator(locatable, 'browser.findElement(locatable)')

		debug('locator %o', locator)

		let maybeElement = await locator.find(await this.context)
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
		let maybeElement = await locator.find(context)
		if (!maybeElement) return null

		const element = maybeElement as ElementHandle

		element.bindBrowser(this)
		return element
	}

	@rewriteError()
	public async findElements(locatable: NullableLocatable): Promise<ElementHandle[]> {
		let locator = locatableToLocator(locatable, 'browser.findElemts(locatable)')
		let elements = await locator.findMany(await this.context)
		elements.forEach(element => element.bindBrowser(this))
		return elements
	}

	public async set(key: string, value: string): Promise<void> {}

	public async get(key: string): Promise<void> {}

	@rewriteError()
	public async extractText(locatable: NullableLocatable): Promise<string> {
		console.warn(`DEPRECATED: Driver.extractText() is deprecated, please use ElementHandle.text()`)
		let locator = locatableToLocator(locatable, 'browser.extractText(locatable) (DEPRECATED)')
		let element = await locator.find(await this.context)
		if (!element) throw toLocatorError(locatable, 'browser.extractText()')
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

	// TODO fix this
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

	public async saveScreenshot(fn: (path: string) => Promise<boolean>): Promise<void> {
		const path = this.workRoot.join('objects', `${cuid()}.jpg`)
		debugScreenshot(`Saving screenshot to: ${path}`)

		if (await fn(path)) {
			this.screenshots.push(path)
			debugScreenshot(`Saved screenshot to: ${path}`)

			termImg(path, {
				width: '40%',
				fallback: () => {
					return `Screenshot path: ${path}`
				},
			})
		}
	}
}
