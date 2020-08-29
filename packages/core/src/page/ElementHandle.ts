import {
	ElementHandle as PElementHandle,
	ClickOptions,
	ScreenshotOptions,
	EvaluateFn,
} from 'puppeteer'
import { ElementHandle as IElementHandle, Locator } from './types'
import {
	ErrorInterpreter,
	AnyErrorData,
	ActionErrorData,
	EmptyErrorData,
	interpretError,
} from '../runtime/errors/Types'
import interpretPuppeteerError from '../runtime/errors/interpretPuppeteerError'
import { StructuredError } from '../utils/StructuredError'
import { Key } from './Enums'
import debugFactory from 'debug'
import { Point } from './Point'
import { CSSLocator } from './locators/index'
// import { By } from './Locators'
const debug = debugFactory('element:page:element-handle')

/**
 * @internal
 */
async function getProperty<T>(element: PElementHandle, prop: string): Promise<T | null> {
	if (!element) {
		return null
	} else {
		const handle = await element.getProperty(prop)
		const value = (await handle.jsonValue()) as T
		handle.dispose()
		return value
	}
}

/**
 * @internal
 */
function wrapDescriptiveError(
	...errorInterpreters: ErrorInterpreter<ElementHandle, AnyErrorData>[]
) {
	errorInterpreters.push(interpretPuppeteerError)

	return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
		const originalFn = descriptor.value

		descriptor.value = async function(...args: any[]) {
			// capture the stack trace at call-time
			const calltimeError = new Error()
			Error.captureStackTrace(calltimeError)
			const calltimeStack = calltimeError.stack

			// const elementHandle = this

			try {
				return await originalFn.apply(this, args)
			} catch (e) {
				debug('interpreting', propertyKey, e)

				const newError = interpretError<ElementHandle, AnyErrorData>(
					errorInterpreters,
					e,
					this,
					propertyKey,
					args,
				)
				// errorInterpreters.reduce((err, interp) => {
				// return err ? err : interp(e, this, propertyKey, ...args)
				// }, undefined) || e

				const sErr = StructuredError.liftWithSource(
					newError,
					'elementHandle',
					`${this.toErrorString()}.${propertyKey}`,
				)
				sErr.stack = calltimeStack

				// attach the call-time stack
				// newError.stack = calltimeStack
				throw sErr
			}
		}
	}
}

/**
 * @internal
 */
function domError(
	err: Error,
	target: ElementHandle,
	key: string /* ,
	callCtx: string,
	options?: ClickOptions, */,
): StructuredError<ActionErrorData | EmptyErrorData> | undefined {
	if (err.message.includes('Node is detached from document')) {
		return new StructuredError<ActionErrorData>(
			'dom error during action',
			{
				_kind: 'action',
				action: key,
				kind: 'node-detached',
			},
			err,
		)
	}
}

/**
 * @internal
 */
interface FilesystemAccessor {
	saveScreenshot(fn: (path: string) => Promise<boolean>): void
	testData(filename: string): string
}

/**
 * ElementHandle represents a remote element in the DOM of the browser. It implements useful methods for querying and interacting with this DOM element.
 *
 * All methods on this class are asynchronous and must be used with `await` to wait for the result to fulfill from the browser.
 */
export class ElementHandle implements IElementHandle, Locator {
	/**
	 * @internal
	 */
	// private screenshotSaver: FilesystemAccessor
	// private workRoot: WorkRoot
	private fs: FilesystemAccessor

	/**
	 * @internal
	 */
	public errorString = '<element-handle>'
	/**
	 * @internal
	 */
	public element: PElementHandle
	constructor(elt: PElementHandle) {
		this.element = elt
	}

	public async initErrorString(foundVia?: string): Promise<ElementHandle> {
		debug('initErrorString', foundVia)
		let tag = await this.tagName()
		const id = await this.getId()

		if (tag === null) tag = 'element-tag'

		let estr = `<${tag.toLowerCase()}`
		if (id !== null) {
			estr += ` id='#${id}'`
		}

		if (foundVia !== null) {
			estr += ` found using '${foundVia}'`
		}

		estr += '>'
		this.errorString = estr
		return this
	}

	public bindBrowser(filesystem: FilesystemAccessor) {
		this.fs = filesystem
	}

	public toErrorString(): string {
		return this.errorString
	}

	async find(/* context: never, node?: never */): Promise<ElementHandle | null> {
		return this
	}

	async findMany(/* context: never, node?: never */): Promise<ElementHandle[]> {
		return [this]
	}

	get pageFuncArgs(): PElementHandle[] {
		return [this.element]
	}

	get pageFunc(): EvaluateFn {
		return (element: HTMLElement) => element
	}

	get pageFuncMany(): EvaluateFn {
		return (element: HTMLElement) => [element]
	}

	/**
	 * Sends a click event to the element attached to this handle. If the element is
	 * currently outside the viewport it will first scroll to that element.
	 */
	@wrapDescriptiveError(domError)
	public async click(options?: ClickOptions): Promise<void> {
		return this.element.click(options)
	}

	/**
	 * Sends a click event to the element attached to this handle. If the element is
	 * currently outside the viewport it will first scroll to that element.
	 */
	@wrapDescriptiveError(domError)
	public async doubleClick(options?: ClickOptions): Promise<void> {
		return this.element.click({ clickCount: 2, ...options })
	}

	/**
	 * Schedules a command to clear the value of this element.
	 * This command has no effect if the underlying DOM element is neither a text
	 * INPUT, SELECT, or a TEXTAREA element.
	 */
	@wrapDescriptiveError()
	public async clear(): Promise<void> {
		const tagName = await this.tagName()
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

	/**
	 * Sends focus to this element so that it receives keyboard inputs.
	 */
	@wrapDescriptiveError()
	public async focus(): Promise<void> {
		return await this.element.focus()
	}

	/**
	 * Clears focus from this element so that it will no longer receive keyboard inputs.
	 */
	@wrapDescriptiveError()
	public async blur(): Promise<void> {
		return await this.element
			.executionContext()
			.evaluate((node: HTMLElement) => node.blur(), this.element)
	}

	/**
	 * Sends a series of key modifiers to the element.
	 */
	@wrapDescriptiveError()
	public async sendKeys(...keys: string[]): Promise<void> {
		const handle = this.element.asElement()
		if (!handle) return

		for (const key of keys) {
			if (Object.values(Key).includes(key)) {
				await handle.press(key)
			} else {
				await handle.type(key)
			}
		}
	}

	/**
	 * Sends a series of key presses to the element to simulate a user typing on the keyboard. Use this to fill in input fields.
	 */
	@wrapDescriptiveError()
	public async type(text: string): Promise<void> {
		await this.focus()

		const handle = this.element.asElement()
		if (!handle) return
		return handle.type(text)
	}

	/**
	 * Sets the value of the file input these files
	 * @param names The name of a file you uploaded with this script. Relative to the script.
	 */
	@wrapDescriptiveError()
	public async uploadFile(...names: string[]): Promise<void> {
		return this.element.uploadFile(...names.map(name => this.fs.testData(name)))
	}

	/**
	 * Takes a screenshot of this element and saves it to the results folder with a random name.
	 */
	@wrapDescriptiveError()
	public async takeScreenshot(options?: ScreenshotOptions): Promise<void> {
		return this.fs.saveScreenshot(async path => {
			debug(`Saving screenshot to: ${path}`)
			console.log(`Saving screenshot to: ${path}`)

			const handle = this.element.asElement()
			if (!handle) return false

			await handle.screenshot({ path, ...options })
			return true
		})
	}

	// TODO wrap
	public async findElement(locator: string | Locator): Promise<IElementHandle | null> {
		if (typeof locator === 'string') {
			const { BaseLocator } = await import('./Locator')
			locator = new BaseLocator(new CSSLocator(locator), 'handle.findElement')
		}
		return locator.find(this.element.executionContext(), this.element)
	}

	/**
	 * Locates all elements using the supplied <[Locator]>, returning an array of <[ElementHandle]>'s
	 */
	public async findElements(locator: string | Locator): Promise<IElementHandle[]> {
		if (typeof locator === 'string') {
			const { BaseLocator } = await import('./Locator')
			locator = new BaseLocator(new CSSLocator(locator), 'handle.findElements')
		}
		return locator.findMany(this.element.executionContext(), this.element)
	}

	/**
	 * Fetches the remote elements `tagName` property.
	 */
	public async tagName(): Promise<string | null> {
		return getProperty<string>(this.element, 'tagName')
	}

	/**
	 * Fetches the remote elements `id` attribute.
	 */
	public async getId(): Promise<string | null> {
		return this.getAttribute('id')
	}

	/**
	 * Fetches the value of an attribute on this element
	 */
	public async getAttribute(key: string): Promise<string | null> {
		const handle = this.element.asElement()
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
	 * If the remote element is selectable (such as an `<option>` or `input[type="checkbox"]`) this methos will indicate whether it is selected.
	 */
	public async isSelected(): Promise<boolean> {
		if (await !this.isSelectable()) {
			throw new Error('Element is not selectable')
		}

		let propertyName = 'selected'
		const tagName = await this.tagName()

		const type = tagName && tagName.toUpperCase()
		if ('CHECKBOX' == type || 'RADIO' == type) {
			propertyName = 'checked'
		}

		const value = getProperty<string>(this.element, propertyName)
		return !!value
	}

	/**
	 * Checks whether the remote element is selectable. An element is selectable if it is an `<option>` or `input[type="checkbox"]` or radio button.
	 */
	public async isSelectable(): Promise<boolean> {
		const tagName = await this.tagName()

		if (tagName === 'OPTION') {
			return true
		}

		if (tagName === 'INPUT') {
			const type = tagName.toLowerCase()
			return type == 'checkbox' || type == 'radio'
		}

		return false
	}

	/**
	 * Checks whether the remote element is displayed in the DOM and is visible to the user without being hidden by CSS or occluded by another element.
	 */
	public async isDisplayed(): Promise<boolean> {
		const box = await this.element.boundingBox()
		return box !== null
	}

	/**
	 * Checks whether the remote element is enabled. Typically this means it does not have a `disabled` property or attribute applied.
	 */
	public async isEnabled(): Promise<boolean> {
		const disabled = await this.getAttribute('disabled')
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
				(element: HTMLElement) => (element.textContent ? element.textContent.trim() : ''),
				this.element,
			)
	}

	/**
	 * Returns a promise that will be resolved with the element's size
	 * as a {width:number, height:number} object
	 */
	public async size(): Promise<{ width: number; height: number }> {
		const box = await this.element.boundingBox()
		if (!box) return { width: 0, height: 0 }

		const { width, height } = box
		return { width, height }
	}

	/**
	 * Returns the center x,y coordinates of the element relative to the page.
	 * This is useful as an input to <[Mouse]> operations such as <drag> or <move>.
	 *
	 * @returns Point The [x,y] coordinates
	 */
	public async centerPoint(): Promise<Point> {
		const box = await this.element.boundingBox()
		if (box == null) return [0, 0]
		const { x, y, height, width } = box
		const cx = Math.round(x + width / 2)
		const cy = Math.round(y + height / 2)
		return [cx, cy]
	}

	/**
	 * Returns a promise that will be resolved to the element's location
	 * as a {x:number, y:number} object.
	 */
	public async location(): Promise<{ x: number; y: number }> {
		const box = await this.element.boundingBox()
		if (!box) return { x: 0, y: 0 }

		const { x, y } = box
		return { x, y }
	}

	// TODO fix with better typings
	private get elementClient(): any {
		return (this.element as any)['_client']
	}

	// TODO fix with better typings
	private get elementRemoteObject(): any {
		return (this.element as any)['_remoteObject']
	}

	public async dispose(): Promise<void> {
		return this.element.dispose()
	}

	public async highlight() {
		await this.elementClient.send('Overlay.highlightNode', {
			highlightConfig: {
				showInfo: true,
				displayAsMaterial: true,
				borderColor: { r: 76, g: 175, b: 80, a: 1 },
				contentColor: { r: 76, g: 175, b: 80, a: 0.24 },
				shapeColor: { r: 76, g: 175, b: 80, a: 0.24 },
			},
			objectId: this.elementRemoteObject.objectId,
		})
	}

	public async clearHighlights() {
		await this.elementClient.send('Overlay.hideHighlight', {})
	}
}
