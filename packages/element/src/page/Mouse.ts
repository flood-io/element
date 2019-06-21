import { Browser } from '../runtime/Browser'
import { MousePressOptions, ClickOptions } from 'puppeteer'

export type Point = [number, number]

export default class Mouse {
	constructor(private browser: Browser<any>) {}

	/**
	 * Dispatches a `mousedown` event
	 */
	public async down(options?: MousePressOptions): Promise<void> {
		return this.browser.page.mouse.down(options)
	}

	/**
	 * Dispatches a `mouseup` event
	 */
	public async up(options?: MousePressOptions): Promise<void> {
		return this.browser.page.mouse.up(options)
	}

	/**
	 * Dispatches a `mousemove` event
	 */
	public async move(...points: Point[]): Promise<void> {
		for (const [x, y] of points) {
			await this.browser.page.mouse.move(x, y)
		}
	}

	/**
	 * Shortcut for `mouse.move`, `mouse.down`, `mouse.move` and `mouse.up`.
	 */
	public async drag(...points: Point[]): Promise<void> {
		let [startingPoint, ...rest] = points
		await this.move(startingPoint)
		await this.down()
		await this.move(...rest)
		await this.up()
	}

	/**
	 * Shortcut for `mouse.move`, `mouse.down` and `mouse.up`.
	 */
	click(x: number, y: number, options?: ClickOptions): Promise<void> {
		return this.browser.page.mouse.click(x, y, options)
	}
}
