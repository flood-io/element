import { Page } from 'playwright'
import { Point, isPoint } from './Point'
import { ElementHandle } from './types'

export type MouseButtons = 'left' | 'right' | 'middle'

export interface ClickOptions {
	/** @default MouseButtons.Left */
	button?: MouseButtons
	/** @default 1 */
	clickCount?: number
	/**
	 * Time to wait between mousedown and mouseup in milliseconds.
	 * @default 0
	 */
	delay?: number
}

export interface MousePressOptions {
	/**
	 * left, right, or middle.
	 * @default left
	 */
	button?: MouseButtons
	/**
	 * The number of clicks.
	 * @default 1
	 */
	clickCount?: number
}

const isElementHandle = (thing: any): thing is ElementHandle => {
	return typeof thing === 'object' && typeof thing.centerPoint === 'function'
}

/**
 * Mouse represents a virtual pointing device which can be used for common Mouse or Touch operations.
 *
 * @class Mouse
 * @public
 */
export default class Mouse {
	constructor(private page: Page) {}

	/**
	 * Dispatches a `mousedown` event
	 */
	public async down(options?: MousePressOptions): Promise<void> {
		return this.page.mouse.down(options)
	}

	/**
	 * Dispatches a `mouseup` event
	 */
	public async up(options?: MousePressOptions): Promise<void> {
		return this.page.mouse.up(options)
	}

	/**
	 * Dispatches a `mousemove` event
	 */
	public async move(x: number, y: number, options?: { steps: number }): Promise<void> {
		return this.page.mouse.move(x, y, options)
	}

	/**
	 * Shortcut for `mouse.move`, `mouse.down`, `mouse.move` and `mouse.up`.
	 */
	public async drag(from: Point, to: Point): Promise<void> {
		await this.move(...from)
		await this.down()
		await this.move(...to)
		await this.up()
	}

	/**
	 * Shortcut for `mouse.move`, `mouse.down` and `mouse.up`.
	 */
	public async click(x: ElementHandle, options?: ClickOptions): Promise<void>
	public async click(x: Point, options?: ClickOptions): Promise<void>
	public async click(x: number, y: number, options?: ClickOptions): Promise<void>
	public async click(
		x: number | Point | ElementHandle,
		y?: number | ClickOptions,
		options?: ClickOptions,
	): Promise<void> {
		if (isElementHandle(x) && typeof options !== 'number') {
			const coords = await x.centerPoint()
			return this.page.mouse.click(coords[0], coords[1], options)
		} else if (isPoint(x) && typeof options !== 'number') {
			return this.page.mouse.click(x[0], x[1], options)
		} else if (typeof x === 'number' && typeof y === 'number') {
			return this.page.mouse.click(x, y, options)
		}
	}
}
