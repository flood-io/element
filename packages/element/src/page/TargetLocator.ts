import { ElementHandle } from './ElementHandle'
import { Page, Frame } from 'puppeteer'
import { TargetLocator as ITargetLocator } from '../../index'
import { getFrames } from '../runtime/Sandbox'

export class TargetLocator implements ITargetLocator {
	constructor(private page: Page, private apply: (frame: Frame | null) => void) {}

	/**
	 * Locates the DOM element on the current page that corresponds to
	 * `document.activeElement` or `document.body` if the active element is not
	 * available.
	 */
	public async activeElement(): Promise<ElementHandle | null> {
		let jsHandle = await this.page.evaluateHandle(() => document.activeElement || document.body)
		if (!jsHandle) return null

		let element = jsHandle.asElement()
		if (!element) return null

		return new ElementHandle(element)
	}

	/**
	 * Navigates to the topmost frame
	 */
	public async defaultContent(): Promise<void> {
		this.apply(null)
	}

	public async frame(id: number | string | ElementHandle) {
		let nextFrame: Frame | null

		if (id === null) {
			this.defaultContent()
			return
		}

		let frames = getFrames(this.page.frames())

		if (typeof id === 'number') {
			// Assume frame index
			let frameElementName = await this.page.evaluate((index: number) => {
				let frame = window.frames[Number(index)]
				if (!frame) throw Error(`No frame found at index: ${index}`)
				return frame.name || frame.id
			}, id)

			nextFrame = frames.find(frame => frame.name() === frameElementName) || null
			if (!nextFrame) throw new Error(`Could not match frame by name or id: '${frameElementName}'`)

			this.apply(nextFrame)
		} else if (typeof id === 'string') {
			// Assume id or name attr
			nextFrame = frames.find(frame => frame.name() === id) || null
			console.log(`Switching to Frame: '${nextFrame.name()}'`)
			this.apply(nextFrame)
		} else if (id instanceof ElementHandle) {
			let tagName = await id.tagName()
			if (!tagName || !['FRAME', 'WINDOW', 'IFRAME'].includes(tagName))
				throw new Error(
					`ElementHandle supplied to frame() must be a reference to a <frame>, window, or <iframe> element, got <${(tagName &&
						tagName.toLowerCase()) ||
						null}>`,
				)
			let name = await id.getProperty('name')
			if (!name) name = await id.getProperty('id')

			nextFrame = frames.find(frame => frame.name() === name) || null
			if (!nextFrame) throw new Error(`Could not match frame by name or id: '${name}'`)

			this.apply(nextFrame)
		}
	}
}
