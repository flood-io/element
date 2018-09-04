import { launch, LaunchOptions } from 'puppeteer'
import { PuppeteerClient, Browser } from '../types'

export type ConcreteLaunchOptions = LaunchOptions & {
	args: string[]
	chrome: boolean | string
	sandbox: boolean
}

const defaultLaunchOptions: ConcreteLaunchOptions = {
	args: [],
	handleSIGINT: false,
	headless: true,
	devtools: false,
	chrome: false,
	sandbox: true,
	timeout: 60e3,
	ignoreHTTPSErrors: false,
}

function setupSystemChrome(options: ConcreteLaunchOptions): ConcreteLaunchOptions {
	if (typeof options.chrome === 'boolean') {
		if (options.chrome) {
			switch (process.platform) {
				case 'darwin':
					options.executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
					break
				default:
					// TODO search PATH for chrome
					options.executablePath = '/usr/bin/google-chrome-stable'
			}
		}
	} else {
		options.executablePath = options.chrome
	}

	options.args.push('--disable-gpu')
	options.args.push('--disable-dev-shm-usage')

	return options
}

export default class Puppeteer implements Browser {
	private isClosed = false
	private clientInitializationPromise: Promise<PuppeteerClient>

	async launch(passedOptions: Partial<ConcreteLaunchOptions> = {}) {
		let options: ConcreteLaunchOptions = {
			...defaultLaunchOptions,
			...passedOptions,
		}

		if (!options.sandbox) {
			options.args.push('--no-sandbox')
			// launchArgs.args.push("--disable-setuid-sandbox");
		}

		options = setupSystemChrome(options)

		// console.log(JSON.stringify(options, null, 2))

		this.clientInitializationPromise = this.initClient(options)

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
