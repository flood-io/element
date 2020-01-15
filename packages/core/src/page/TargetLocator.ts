import { ElementHandle } from './ElementHandle'
import { Page, Frame } from 'puppeteer'
import { TargetLocator as ITargetLocator, ElementHandle as IElementHandle } from './types'
import { getFrames } from '../runtime/Browser'

/**
 * @internal
 */
export class TargetLocator implements ITargetLocator {
	constructor(private page: Page, private apply: (frame: Frame | null) => void) {}

	public async activeElement(): Promise<ElementHandle | null> {
		const jsHandle = await this.page.evaluateHandle(() => document.activeElement || document.body)
		if (!jsHandle) return null

		const element = jsHandle.asElement()
		if (!element) return null

		return new ElementHandle(element).initErrorString()
	}

	/**
	 * Navigates to the topmost frame
	 */
	public async defaultContent(): Promise<void> {
		this.apply(null)
	}

	/**
	 * Changes the active target to another frame.
	 *
	 * Accepts either:
	 *
	 * number: Switch to frame by index in window.frames,
	 * string: Switch to frame by frame.name or frame.id, whichever matches first,
	 * ElementHandle: Switch to a frame using the supplied ElementHandle of a frame.
	 *
	 * @param id number | string | ElementHandle
	 */
	public async frame(id: number | string | IElementHandle) {
		let nextFrame: Frame | null

		if (id === null) {
			this.defaultContent()
			return
		}

		const frames = getFrames(this.page.frames())

		if (typeof id === 'number') {
			// Assume frame index
			const frameElementName = await this.page.evaluate((index: number) => {
				// NOTE typescript lib.dom lacks proper index signature for frames: Window to work
				const frame = (window as any).frames[Number(index)]

				if (!frame) throw Error(`No frame found at index: ${index}`)
				return frame.name || frame.id
			}, id)

			nextFrame = frames.find(frame => frame.name() === frameElementName) || null
			if (!nextFrame) throw new Error(`Could not match frame by name or id: '${frameElementName}'`)

			this.apply(nextFrame)
		} else if (typeof id === 'string') {
			// Assume id or name attr
			nextFrame = frames.find(frame => frame.name() === id) || null

			const frameElementName = await this.page.evaluate((id: string) => {
				// NOTE typescript lib.dom lacks proper index signature for frames: Window to work
				const frame = Array.from(window.frames).find(frame => frame.frameElement.id === id)

				if (!frame) throw Error(`No frame found with id=${id}`)
				return frame.name
			}, id)

			nextFrame = frames.find(frame => frame.name() === frameElementName) || null

			if (!nextFrame) throw new Error(`Could not match frame by name or id: '${id}'`)
			this.apply(nextFrame)
		} else if (id instanceof ElementHandle) {
			const tagName = await id.tagName()
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
