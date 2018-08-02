import { ElementHandle as PElementHandle, ClickOptions, ScreenshotOptions } from 'puppeteer'
import { ElementHandle as IElementHandle } from '../../index'
import { Locator } from './Locator'
import { By } from './By'
import * as debugFactory from 'debug'
import { Key } from './Enums'
const debug = debugFactory('element:page:element-handle')

async function getProperty<T>(element: PElementHandle, prop: string): Promise<T | null> {
	if (!element) {
		return null
	} else {
		let handle = await element.getProperty(prop)
		let value = await handle.jsonValue()
		handle.dispose()
		return value
	}
}

export function wrapDescriptiveError() {
	return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
		let originalFn = descriptor.value

		descriptor.value = async function(...args: any[]) {
			// capture the stack trace at call-time
			const calltimeError = new Error()
			Error.captureStackTrace(calltimeError)
			const calltimeStack = calltimeError.stack

			try {
				return await originalFn.apply(this, args)
			} catch (e) {
				let newError = new Error(`error performing element.${propertyKey}: ${e}`)
				// attach the call-time stack
				newError.stack = calltimeStack
				throw newError
			}
		}
	}
}

interface ScreenshotSaver {
	saveScreenshot(fn: (path: string) => Promise<boolean>)
}

export class ElementHandle implements IElementHandle {
	public screenshotSaver: ScreenshotSaver
	constructor(private element: PElementHandle) {}

	public bindBrowser(sss: ScreenshotSaver) {
		this.screenshotSaver = sss
	}

	public toErrorString() {
		return this.toString()
	}

	@wrapDescriptiveError()
	public async click(options?: ClickOptions): Promise<void> {
		return this.element.click(options)
	}

	@wrapDescriptiveError()
	public async clear(): Promise<void> {
		let tagName = await this.tagName()
		if (tagName === 'SELECT') {
			await this.element
				.executionContext()
				.evaluate((element: HTMLSelectElement) => (element.selectedIndex = -1), this.element)
		} else if (tagName === 'INPUT') {
			await this.element
				.executionContext()
				.evaluate((element: HTMLInputElement) => (element.value = ''), this.element)
		}
	}

	@wrapDescriptiveError()
	public async focus(): Promise<void> {
		return await this.element.focus()
	}

	@wrapDescriptiveError()
	public async blur(): Promise<void> {
		return await this.element
			.executionContext()
			.evaluate((node: HTMLElement) => node.blur(), this.element)
	}

	@wrapDescriptiveError()
	public async sendKeys(...keys: string[]): Promise<void> {
		let handle = this.element.asElement()
		if (!handle) return

		for (const key of keys) {
			if (Object.values(Key).includes(key)) {
				await handle.press(key)
			} else {
				await handle.type(key)
			}
		}
	}

	@wrapDescriptiveError()
	public async type(text: string): Promise<void> {
		let handle = this.element.asElement()
		if (!handle) return
		return handle.type(text)
	}

	@wrapDescriptiveError()
	public async takeScreenshot(options?: ScreenshotOptions): Promise<void> {
		return this.screenshotSaver.saveScreenshot(async path => {
			debug(`Saving screenshot to: ${path}`)
			console.log(`Saving screenshot to: ${path}`)

			const handle = this.element.asElement()
			if (!handle) return false

			await handle.screenshot({ path, ...options })
			return true
		})
	}

	public async findElement(locator: string | Locator): Promise<IElementHandle | null> {
		if (typeof locator === 'string') {
			locator = By.css(locator)
		}
		return locator.find(this.element.executionContext(), this.element)
	}

	public async findElements(locator: string | Locator): Promise<IElementHandle[]> {
		if (typeof locator === 'string') {
			locator = By.css(locator)
		}
		return locator.findMany(this.element.executionContext(), this.element)
	}

	/**
	 * Returns a promise that will be resolved with the element's tag name.
	 */
	public async tagName(): Promise<string | null> {
		return getProperty<string>(this.element, 'tagName')
	}

	public async getId(): Promise<string | null> {
		return this.getAttribute('id')
	}

	/**
	 * getAttribute
	 */
	public async getAttribute(key: string): Promise<string | null> {
		let handle = this.element.asElement()
		if (!handle) return null

		return handle
			.executionContext()
			.evaluate((element: HTMLElement, key: string) => element.getAttribute(key), this.element, key)
	}

	/**
	 * getProperty
	 */
	public async getProperty(key: string): Promise<string | null> {
		return getProperty<string>(this.element, key)
	}

	/**
	 * Returns whether the element is checked or selected
	 */
	public async isSelected(): Promise<boolean> {
		if (await !this.isSelectable()) {
			throw new Error('Element is not selectable')
		}

		var propertyName = 'selected'
		let tagName = await this.tagName()

		var type = tagName && tagName.toUpperCase()
		if ('CHECKBOX' == type || 'RADIO' == type) {
			propertyName = 'checked'
		}

		let value = getProperty<string>(this.element, propertyName)
		return !!value
	}

	public async isSelectable(): Promise<boolean> {
		let tagName = await this.tagName()

		if (tagName === 'OPTION') {
			return true
		}

		if (tagName === 'INPUT') {
			let type = tagName.toLowerCase()
			return type == 'checkbox' || type == 'radio'
		}

		return false
	}

	public async isDisplayed(): Promise<boolean> {
		let box = await this.element.boundingBox()
		return box !== null
	}

	public async isEnabled(): Promise<boolean> {
		let disabled = await this.getAttribute('disabled')
		return disabled === null
	}

	/**
	 * Get the visible (i.e. not hidden by CSS) innerText of this element, including sub-elements, without any leading or trailing whitespace.
	 *
	 * @returns {Promise<string>}
	 * @memberof ElementHandle
	 */

	public async text(): Promise<string> {
		return this.element
			.executionContext()
			.evaluate(
				(element: HTMLElement) => element.textContent && element.textContent.trim(),
				this.element,
			)
	}

	/**
	 * Returns a promise that will be resolved with the element's size
	 * as a {width:number, height:number} object
	 */
	public async size(): Promise<{ width: number; height: number }> {
		let box = await this.element.boundingBox()
		if (!box) return { width: 0, height: 0 }

		let { width, height } = box
		return { width, height }
	}

	/**
	 * Returns a promise that will be resolved to the element's location
	 * as a {x:number, y:number} object.
	 */
	public async location(): Promise<{ x: number; y: number }> {
		let box = await this.element.boundingBox()
		if (!box) return { x: 0, y: 0 }

		let { x, y } = box
		return { x, y }
	}

	public async dispose(): Promise<void> {
		return this.element.dispose()
	}

	public async highlight() {
		let client = this.element['_client']
		await client.send('Overlay.highlightNode', {
			highlightConfig: {
				showInfo: true,
				displayAsMaterial: true,
				borderColor: { r: 76, g: 175, b: 80, a: 1 },
				contentColor: { r: 76, g: 175, b: 80, a: 0.24 },
				shapeColor: { r: 76, g: 175, b: 80, a: 0.24 },
			},
			objectId: this.element['_remoteObject'].objectId,
		})
	}

	public async clearHighlights() {
		let client = this.element['_client']
		await client.send('Overlay.hideHighlight', {})
	}
}
