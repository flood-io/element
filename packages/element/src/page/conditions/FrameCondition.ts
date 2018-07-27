import { Condition } from '../Condition'
import { Frame, Page } from 'puppeteer'
import { getFrames } from '../../runtime/Sandbox'
import { Locatable } from '../../../index'

export class FrameCondition extends Condition {
	constructor(public id: string | Locatable) {
		super(null, null)
	}

	toString() {
		return `frame [name='${this.id}']`
	}

	// public async waitFor(frame: Frame, page: Page): Promise<Frame | Error> {
	// 	let { timeout } = this

	// 	console.log(page.target().type())

	// 	page.on('framenavigated', frame => {
	// 		console.log(`Frame: '${frame.name()}'`)
	// 	})

	// 	return frame.waitForFunction(
	// 		(id: string) => {
	// 			function getFrames(frame) {
	// 				const frames = []

	// 				Array.from(frame.frames).forEach(f => {
	// 					frames.push(f)
	// 					frames.push(...getFrames(f))
	// 				})

	// 				return frames
	// 			}

	// 			let frames = getFrames(window)
	// 			return frames.find(frame => frame.name === id || frame.id === id)

	// 			// if (typeof title === 'string') {
	// 			// 	if (title.startsWith('/') && title.endsWith('/')) {
	// 			// 		// RegExp
	// 			// 		let exp = new RegExp(title.slice(1, title.length - 1))
	// 			// 		return exp.test(document.title)
	// 			// 	} else if (partial) {
	// 			// 		return document.title.indexOf(title) > -1
	// 			// 	} else {
	// 			// 		return document.title.trim() === title.trim()
	// 			// 	}
	// 			// }
	// 		},
	// 		{ polling: 'raf', timeout },
	// 		this.id,
	// 	)
	// }

	public async waitFor(frame: Frame, page: Page): Promise<Frame | Error> {
		let waiterPromise = new Promise<Frame>(yeah => {
			const cleanup = () => {
				page.removeListener('framenavigated', handler)
			}

			const handler = (frame: Frame) => {
				// console.log(`Frame: '${frame.name()}'`)
				if (frame.name() === this.id) {
					cleanup()
					yeah(frame)
				}
			}

			page.addListener('framenavigated', handler)

			if (typeof this.id === 'string') {
				// Check all existing frames as well to ensure we don't race
				let frames = getFrames(page.frames())
				for (const frame of frames) {
					handler(frame)
				}
			} else {
				throw new Error(
					`Calling ableToSwitchFrame() with anything other than frame name or ID as a string is not yet supported.`,
				)
			}
		})

		return Promise.race<Frame | Error>([waiterPromise, this.createTimeoutPromise()]).then(
			result => {
				clearTimeout(this.maximumTimer)
				return result
			},
		)
	}

	private maximumTimer: NodeJS.Timer

	private createTimeoutPromise() {
		// if (!this.timeout) return new Promise(() => {})
		const errorMessage = `Frame Wait Timeout Exceeded: ${this.timeout}ms exceeded`
		return new Promise<Error>(yeah => (this.maximumTimer = setTimeout(yeah, this.timeout))).then(
			() => new Error(errorMessage),
		)
	}
}
