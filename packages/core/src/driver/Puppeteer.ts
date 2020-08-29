import puppeteer, { LaunchOptions, Browser, Page } from 'puppeteer'

import { ChromeVersion } from '../runtime/Settings'

export type ConcreteLaunchOptions = LaunchOptions & {
	args: string[]
	chromeVersion: ChromeVersion | string
	sandbox: boolean
	debug: boolean
}

const defaultLaunchOptions: ConcreteLaunchOptions = {
	args: [],
	handleSIGINT: false,
	headless: true,
	devtools: false,
	chromeVersion: 'puppeteer',
	sandbox: true,
	timeout: 60e3,
	ignoreHTTPSErrors: false,
	debug: false,
}

function setupSystemChrome(options: ConcreteLaunchOptions): ConcreteLaunchOptions {
	switch (process.platform) {
		case 'darwin':
			options.executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
			break
		case 'win32':
			options.executablePath = 'C:Program Files (x86)GoogleChromeApplicationchrome.exe'
			break
		default:
			// TODO search PATH for chrome
			options.executablePath = '/usr/bin/google-chrome-stable'
	}
	options.args.push('--disable-gpu')
	options.args.push('--disable-dev-shm-usage')

	return options
}
function setupChrome(options: ConcreteLaunchOptions): ConcreteLaunchOptions {
	switch (options.chromeVersion) {
		case 'puppeteer':
			options.executablePath = undefined
			return options
		case 'stable':
			return setupSystemChrome(options)
		default:
			options.executablePath = options.chromeVersion
			options.args.push('--disable-gpu')
			options.args.push('--disable-dev-shm-usage')
			return options
	}
}

export interface PuppeteerClientLike {
	browser: Browser
	page: Page
	close(): Promise<void>
	reopenPage(incognito: boolean): Promise<void>
}

export class PuppeteerClient implements PuppeteerClientLike {
	constructor(public browser: Browser, public page: Page) {}

	private _isClosed = false
	async close(): Promise<void> {
		if (this._isClosed) return
		await this.browser.close()
		this._isClosed = true
	}

	async reopenPage(incognito = false): Promise<void> {
		for (const page of await this.browser.pages()) {
			await page.close()
		}

		if (incognito) {
			const context = await this.browser.createIncognitoBrowserContext()
			this.page = await context.newPage()
		} else {
			this.page = await this.browser.newPage()
		}
	}
}

export async function launch(
	passedOptions: Partial<ConcreteLaunchOptions> = {},
): Promise<PuppeteerClient> {
	let options: ConcreteLaunchOptions = {
		...defaultLaunchOptions,
		...passedOptions,
	}

	if (!options.sandbox) {
		options.args.push('--no-sandbox')
		// launchArgs.args.push("--disable-setuid-sandbox");
	}

	// if (options.debug) {
	// 	console.dir(options)
	// }

	options = setupChrome(options)

	// options.args.push('--single-process', '--no-zygote')

	options.args.push('--auth-server-whitelist="hostname/domain"')

	const browser = await puppeteer.launch(options)
	const page = await browser.newPage()

	return new PuppeteerClient(browser, page)
}

export class NullPuppeteerClient implements PuppeteerClientLike {
	public browser: Browser
	public page: Page

	async close(): Promise<void> {
		return
	}
	async reopenPage() {
		return
	}
}
