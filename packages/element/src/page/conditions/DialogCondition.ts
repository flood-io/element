import { Condition } from '../Condition'
import { Frame, Page, Dialog } from 'puppeteer'
import { clearTimeout } from 'timers'

/**
 * TODO: Generalize waitFor such that we can avoid needing waitForEvent custom
 * handler.
 */
export class DialogCondition extends Condition {
	constructor() {
		super(null, null)
	}

	toString() {
		return 'waiting for dialog to appear'
	}

	hasWaitFor = false

	public async waitFor(frame: Frame): Promise<boolean> {
		return true
	}

	public async waitForEvent(page: Page): Promise<Dialog> {
		return new Promise<Dialog>((yeah, nah) => {
			let { waitTimeout } = this.settings
			let timeout = setTimeout(nah, waitTimeout * 1e3)

			page.once('dialog', (dialog: Dialog) => {
				clearTimeout(timeout)
				yeah(dialog)
			})
		})
	}
}
