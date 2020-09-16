import { DEFAULT_SETTINGS } from '@flood/element'
import { PuppeteerClientLike, launch } from '../../src/driver/Puppeteer'
export { PuppeteerClientLike as testPuppeteer }

export async function launchPuppeteer(): Promise<PuppeteerClientLike> {
	let opts = {
		sandbox: true,
	}

	if (process.env.NO_CHROME_SANDBOX === '1') {
		opts.sandbox = false
	}

	return launch(opts, DEFAULT_SETTINGS)
}
