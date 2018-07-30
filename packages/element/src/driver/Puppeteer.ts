import { launch, LaunchOptions } from 'puppeteer'
import { PuppeteerClient, Browser } from '../types'

type ConcreteLaunchOptions = LaunchOptions & {
	args: string[]
}

const defaultLaunchOptions: ConcreteLaunchOptions = {
	args: [],
	handleSIGINT: false,
	headless: parseInt(process.env.HEADLESS || '1') === 1,
	devtools: parseInt(process.env.DEVTOOLS || '0') === 1,
	timeout: 60e3,
	ignoreHTTPSErrors: false,
}

export default class Puppeteer implements Browser {
	private isClosed = false
	private clientInitializationPromise: Promise<PuppeteerClient>

	async launch(options: LaunchOptions = {}) {
		let launchArgs: ConcreteLaunchOptions = { args: <string[]>[] }

		const noSandbox = process.env.NO_CHROME_SANDBOX === '1'
		if (noSandbox) {
			launchArgs.args.push('--no-sandbox')
			// launchArgs.args.push("--disable-setuid-sandbox");
		}

		// In docker
		if (process.env.USE_SYSTEM_CHROMIUM) {
			launchArgs = {
				...launchArgs,
				executablePath: '/usr/bin/google-chrome-stable',
			}
			launchArgs.args.push('--disable-gpu')
			launchArgs.args.push('--disable-dev-shm-usage')
		}

		if (process.env.USE_SYSTEM_CHROME_MAC) {
			launchArgs = {
				...launchArgs,
				executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
			}
			launchArgs.args.push('--disable-gpu')
			launchArgs.args.push('--disable-dev-shm-usage')
		}

		let finalOptions = {
			...defaultLaunchOptions,
			...options,
			...launchArgs,
		}
		// console.log(JSON.stringify(finalOptions, null, 2))
		this.clientInitializationPromise = this.initClient(finalOptions)

		return this.clientInitializationPromise
	}

	private async initClient(opts: LaunchOptions): Promise<PuppeteerClient> {
		this.isClosed = false
		let browser = await launch(opts)
		let page = await browser.newPage()
		return { page, browser }
	}

	async client(): Promise<PuppeteerClient> {
		if (!this.clientInitializationPromise) return this.launch()
		return this.clientInitializationPromise
	}

	/**
	 * Closes the current browser instance
	 *
	 * @memberof Puppeteer
	 */
	public async close(): Promise<void> {
		if (this.isClosed) return

		let { browser } = await this.clientInitializationPromise
		await browser.close()
		this.isClosed = true
	}
}
