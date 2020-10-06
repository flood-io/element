import { ElementHandle } from './ElementHandle'
import { Page, Frame } from 'playwright'
import { TargetLocator as ITargetLocator, ElementHandle as IElementHandle } from './types'
import { getFrames } from '../utils/frames'

/**
 * @internal
 */
export class TargetLocator implements ITargetLocator {
	constructor(
		private currentPage: Page,
		private currentFrame: Frame,
		private applyFrame: (frame: Frame | null) => void,
		private applyPage: (page: number | Page) => void,
	) {}

	public async activeElement(): Promise<ElementHandle | null> {
		const jsHandle = await this.currentPage.evaluateHandle(
			() => document.activeElement || document.body,
		)
		if (!jsHandle) return null

		const element = jsHandle.asElement()
		if (!element) return null

		return new ElementHandle(element, this.currentPage, this.currentFrame).initErrorString()
	}

	private async findFrameFromWindow(id: string | null): Promise<Frame | undefined> {
		const frames = getFrames(this.currentPage.frames())
		const frameElementName = await this.currentPage.evaluate((id: string) => {
			// NOTE typescript lib.dom lacks proper index signature for frames: Window to work
			const frame = Array.from(window.frames).find(frame => frame.frameElement.id === id)

			if (!frame) throw Error(`No frame found with id=${id}`)
			return frame.name
		}, id)

		return frames.find(frame => frame.name() === frameElementName)
	}

	/**
	 * Navigates to the topmost frame
	 */
	public async defaultContent(): Promise<void> {
		this.applyFrame(null)
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
		if (id === null) {
			this.defaultContent()
			return
		}

		let nextFrame: Frame | undefined

		const frames = getFrames(this.currentPage.frames())

		if (typeof id === 'number') {
			// Assume frame index
			const frameElementName = await this.currentPage.evaluate((index: number) => {
				// NOTE typescript lib.dom lacks proper index signature for frames: Window to work
				const frame = (window as any).frames[Number(index)]

				if (!frame) throw Error(`No frame found at index: ${index}`)
				return frame.name || frame.id
			}, id)

			nextFrame = frames.find(frame => frame.name() === frameElementName)
			if (!nextFrame) throw new Error(`Could not match frame by name or id: '${frameElementName}'`)

			this.applyFrame(nextFrame)
		} else if (typeof id === 'string') {
			// Assume id or name attr
			nextFrame = frames.find(frame => frame.name() === id)
			if (!nextFrame) {
				nextFrame = await this.findFrameFromWindow(id)
			}

			if (!nextFrame) throw new Error(`Could not match frame by name or id: '${id}'`)
			this.applyFrame(nextFrame)
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

			nextFrame = frames.find(frame => frame.name() === name)
			if (!nextFrame) {
				nextFrame = await this.findFrameFromWindow(name)
			}
			if (!nextFrame) throw new Error(`Could not match frame by name or id: '${name}'`)

			this.applyFrame(nextFrame)
		}
	}

	/**
	 * Switch the focus to another page in the browser.
	 *
	 * Accepts either:
	 *
	 * number: The index of the page in Browser.pages,
	 * Page: The page to switch to.
	 *
	 * @param page number | Page
	 */
	public async page(page: number | Page) {
		await this.applyPage(page)
	}
}
