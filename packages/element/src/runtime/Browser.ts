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
import * as DeviceDescriptors from 'puppeteer/DeviceDescriptors'
import CustomDeviceDescriptors from '../utils/CustomDeviceDescriptors'
import { Locator } from '../page/Locator'
import { ElementHandle } from '../page/ElementHandle'
import { TargetLocator } from '../page/TargetLocator'
import { By } from '../page/By'
import * as debugFactory from 'debug'
import { Browser as BrowserInterface, EvaluateFn } from '../../index'
import { PuppeteerClient, WorkRoot } from '../types'
import { join, resolve } from 'path'
import * as cuid from 'cuid'
import { Key } from '../page/Enums'
import { readFileSync } from 'fs'
import * as termImg from 'term-img'
import { ConcreteTestSettings } from './Settings'
import { StructuredError, DocumentedError } from './Error'

const debug = debugFactory('element:browser')
const debugScreenshot = debugFactory('element:browser:screenshot')

export type Locatable = Locator | string

export type NullableLocatable = Locatable | null

type NetworkErrorKind = 'net' | 'http'
type NetworkErrorData = { kind: NetworkErrorKind; subKind: string; reason?: string; code?: string }

export class ElementNotFound extends DocumentedError {
	constructor(locatable: NullableLocatable, callCtx?: string) {
		let desc: string
		let doc: string
		if (locatable === null) {
			desc = 'null locator'
			doc = `The requested location was null. Check whether the locatable was set.`
		} else if (typeof locatable === 'string') {
			desc = locatable
			doc = `The requested location was '${locatable}' but didn't match anything on the page.`
		} else {
			desc = locatable.toErrorString()
			doc = `The requested location was '${desc}' but didn't match anything on the page.`
		}
		super(`No element was found on the page using '${desc}'`, doc, callCtx)
		// Object.setPrototypeOf(this, ElementNotFound.prototype)
		this.name = 'ElementNotFound'
	}
}

export function locatableToLocator(el: NullableLocatable, callCtx: string): Locator {
	if (el === null) {
		throw new DocumentedError(
			'locatable is null',
			`In a call to ${callCtx} the locatable parameter was null.`,
			callCtx,
		)
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
function wrapWithCallbacks<T>() {
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
				const newError = browser.interpretError(propertyKey as keyof Browser<T>, e, args)
				// attach the call-time stack
				newError.stack = calltimeStack
				throw newError
			}
			if (browser.afterFunc instanceof Function) await browser.afterFunc(browser, propertyKey)
			return ret
		}

		return descriptor
	}
}

function errorInterpreter<T>(...targets: string[]) {
	return function(target: Browser<T>, propertyKey: string, descriptor: PropertyDescriptor) {
		if (target.errorInterpreters === undefined) {
			target.errorInterpreters = {}
		}
		for (const t of targets) {
			target.errorInterpreters[t] = descriptor.value
		}
	}
}

type errorInterp = (err: Error, key: string, ...args: any[]) => DocumentedError

export class Browser<T> implements BrowserInterface {
	public screenshots: string[]
	customContext: T
	errorInterpreters: { [K in keyof Browser<T>]?: errorInterp }

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
	}

	interpretError(key: keyof Browser<T>, err: Error, originalArgs: any[]): DocumentedError {
		const interp = this.errorInterpreters[key]
		if (interp !== undefined && typeof interp === 'function') {
			return interp.apply(this, [err, key, ...originalArgs])
		} else {
			debug('wrapping unhandled error %O', err)
			return DocumentedError.wrapUnhandledError(err)
		}
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
				kind: 'http',
				subKind: 'no-response',
			})
		}
		if (!response.ok()) {
			throw new StructuredError<NetworkErrorData>('http response code not OK', {
				kind: 'http',
				subKind: 'not-ok',
				code: response.status().toString(),
			})
		}

		return
	}

	@errorInterpreter('visit')
	public visitError(
		err: Error,
		key: string,
		url: string,
		options: NavigationOptions = {},
	): DocumentedError {
		const callCtx = 'browser.visit()'
		debug('visitError', err)
		const sErr = StructuredError.cast<NetworkErrorData>(err)
		if (sErr) {
			const { kind, subKind } = sErr.data
			if (kind === 'net' && subKind == 'not-resolved') {
				return new DocumentedError(
					`Unable to resolve DNS for ${url}`,
					`Element tried to visit The URL ${url} but it didn't resolve in DNS. This may be due to TODO`,
					callCtx,
					err,
				)
			} else if (kind === 'http' && subKind == 'not-ok') {
				return new DocumentedError(
					`Unable to visit ${url}`,
					`Element tried to visit The URL ${url} but it responded with status code ${
						sErr.data.code
					}. We expected a response code 200-299.`,
					callCtx,
					err,
				)
			}
		}

		return DocumentedError.wrapUnhandledError(err, `Unable to visit ${url}`, callCtx)
	}

	/**
	 * Sends a click event to the element located at `selector`. If the element is
	 * currently outside the viewport it will first scroll to that element.
	 */
	@wrapWithCallbacks()
	public async click(selectorOrLocator: NullableLocatable, options?: ClickOptions): Promise<void> {
		const element = await this.findElement(selectorOrLocator)
		return element.click(options)
	}

	/**
	 * Sends a double-click event to the element located by the supplied Locator or `selector`. If the element is
	 * currently outside the viewport it will first scroll to that element.
	 */
	@wrapWithCallbacks()
	public async doubleClick(
		selectorOrLocator: NullableLocatable,
		options?: ClickOptions,
	): Promise<void> {
		const element = await this.findElement(selectorOrLocator)
		return element.click({ clickCount: 2, ...options })
	}

	@wrapWithCallbacks()
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

	@wrapWithCallbacks()
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

	@wrapWithCallbacks()
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

	@wrapWithCallbacks()
	public async clear(locatable: NullableLocatable | string): Promise<void> {
		let locator = locatableToLocator(locatable, 'browser.clear()')
		let elements = await locator.findMany(await this.context)
		for (const element of elements) {
			await element.clear()
		}
	}

	@wrapWithCallbacks()
	public async type(
		locatable: NullableLocatable,
		text: string,
		options?: { delay: number },
	): Promise<void> {
		let element = await this.findElement(locatable)

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
	public async blur(locatable: NullableLocatable): Promise<void> {
		const element = await this.findElement(locatable)
		return element.blur()
	}

	@wrapWithCallbacks()
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

	public async findElement(locatable: NullableLocatable): Promise<ElementHandle> {
		let locator = locatableToLocator(locatable, 'browser.findElement(locatable)')

		debug('locator %o', locator)

		let element = await locator.find(await this.context)
		if (!element) {
			throw new ElementNotFound(locatable, 'browser.findElement()')
		}

		element.bindBrowser(this)

		return element
	}

	public async maybeFindElement(locatable: NullableLocatable): Promise<ElementHandle | null> {
		if (locatable === null) {
			return null
		}

		const locator = locatableToLocator(locatable, 'browser.maybeFindElement(locatable)')
		const context = await this.context
		let element = await locator.find(context)
		if (!element) return null

		element.bindBrowser(this)
		return element
	}

	public async findElements(locatable: NullableLocatable): Promise<ElementHandle[]> {
		let locator = locatableToLocator(locatable, 'browser.findElemts(locatable)')
		let elements = await locator.findMany(await this.context)
		elements.forEach(element => element.bindBrowser(this))
		return elements
	}

	public async set(key: string, value: string): Promise<void> {}

	public async get(key: string): Promise<void> {}

	public async extractText(locatable: NullableLocatable): Promise<string> {
		console.warn(`DEPRECATED: Driver.extractText() is deprecated, please use ElementHandle.text()`)
		let locator = locatableToLocator(locatable, 'browser.extractText(locatable) (DEPRECATED)')
		let element = await locator.find(await this.context)
		if (!element) throw new ElementNotFound(locatable, 'browser.extractText()')
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
