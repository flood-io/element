import { Condition, NullableLocatable } from '../Condition'
import { Frame, Page } from 'playwright'
import { getFrames } from '../../runtime/Browser'
import { setTimeout } from 'timers'

export class FrameCondition extends Condition {
	constructor(desc: string, public id: NullableLocatable) {
		super(desc)
	}

	toString() {
		return `frame [name='${this.id}']`
	}

	async waitForEvent() {
		return
	}

	public async waitFor(frame: Frame, page: Page): Promise<Frame | Error> {
		const waiterPromise = new Promise<Frame>(yeah => {
			const cleanup = () => {
				// eslint-disable-next-line @typescript-eslint/no-use-before-define
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
				const frames = getFrames(page.frames())
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

	private async createTimeoutPromise() {
		const errorMessage = `Frame Wait Timeout Exceeded: ${this.timeout}ms exceeded`
		return new Promise<Error>(yeah => (this.maximumTimer = setTimeout(yeah, this.timeout))).then(
			() => new Error(errorMessage),
		)
	}
}
