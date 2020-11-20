import { Condition } from '../Condition'
import { Page, Dialog } from 'puppeteer'
import { clearTimeout, setTimeout } from 'timers'

const isDialog = (thing: any): thing is Dialog => {
	return typeof thing?.message == 'function'
}

/**
 * TODO: Generalize waitFor such that we can avoid needing waitForEvent custom
 * handler.
 */
export class DialogCondition extends Condition {
	toString() {
		return 'waiting for dialog to appear'
	}

	hasWaitFor = false

	public async waitFor(): Promise<boolean> {
		return true
	}

	public async waitForEvent(page: Page): Promise<Dialog | null> {
		return new Promise<Dialog>((yeah, nah) => {
			const timeout = setTimeout(nah, Number(this.timeout))

			page.once('dialog', (dialog: Dialog) => {
				if (isDialog(dialog)) {
					clearTimeout(timeout)
					yeah(dialog)
				}
			})
		}).catch(() => null)
	}
}
