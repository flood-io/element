import PuppeteerDriver from '../../src/driver/Puppeteer'
import { Browser, Page } from 'puppeteer'

export interface testPuppeteer {
	browser: Browser
	page: Page
	close: () => Promise<void>
}

export async function launchPuppeteer(): Promise<testPuppeteer> {
	let opts = {
		sandbox: true,
	}

	if (process.env.NO_CHROME_SANDBOX === '1') {
		opts.sandbox = false
	}

	const driver = new PuppeteerDriver()
	await driver.launch(opts)
	const client = await driver.client()
	const close = async () => {
		await driver.close()
	}
	return { browser: client.browser, page: client.page, close }
}
