import playwright, { LaunchOptions, Browser, Page, BrowserServer } from 'playwright'
import { ConcreteTestSettings } from '../runtime/Settings'
import { BrowserType } from '../page/types'
import chalk from 'chalk'

export type ConcreteLaunchOptions = LaunchOptions & {
	args: string[]
	sandbox: boolean
	debug: boolean
	browser: BrowserType
	viewport: playwright.ViewportSize | null
	ignoreHTTPSError: boolean
	showScreenshot: boolean
}

const defaultLaunchOptions: ConcreteLaunchOptions = {
	args: [],
	handleSIGINT: false,
	headless: true,
	devtools: false,
	sandbox: true,
	timeout: 60e3,
	debug: false,
	browser: 'chromium',
	viewport: null,
	ignoreHTTPSError: false,
	showScreenshot: false,
}

export interface PlaywrightClientLike {
	browser: Browser
	page: Page
	close(): Promise<void>
	reopenPage(incognito: boolean): Promise<void>
	closePages(): Promise<void>
	isFirstRun(): boolean
}

export class PlaywrightClient implements PlaywrightClientLike {
	constructor(public browser: Browser, public page: Page) {}

	private _isClosed = false
	private _firstRun = true

	async close(): Promise<void> {
		if (this._isClosed) return
		await this.browser.close()
		this._isClosed = true
	}

	isFirstRun(): boolean {
		return this._firstRun
	}

	async reopenPage(incognito = false): Promise<void> {
		if (this._firstRun) {
			this._firstRun = false
			return
		}
		await this.closePages()
		if (incognito) {
			const context = await this.browser.newContext()
			this.page = await context.newPage()
		} else {
			this.page = await this.browser.newPage()
		}
	}

	async closePages(): Promise<void> {
		const pages = this.page.context().pages()
		for (const page of pages) {
			await page.close()
		}
	}
}

export async function launchBrowserServer(
	passedOptions: Partial<ConcreteLaunchOptions> = {}
): Promise<BrowserServer> {
	const options: ConcreteLaunchOptions = {
		...defaultLaunchOptions,
		...passedOptions,
	}

	if (!options.sandbox && ['chrome', 'chromium'].includes(options.browser)) {
		options.args.push('--no-sandbox')
	}

	if (options.debug) {
		console.dir(options)
	}

	if (options.browser !== 'webkit') {
		options.args.push('--auth-server-whitelist="hostname/domain"')
	}

	let browserType = options.browser || 'chromium'
	// can not run multiple users on chrome, need to switch back to chromium
	if (browserType === 'chrome') {
		browserType = 'chromium'
	}
	return playwright[browserType].launchServer(options)
}

export async function connectWS(wsEndpoint: string, type?: BrowserType): Promise<PlaywrightClient> {
	let browserType = type || 'chromium'
	// can not run multiple users on chrome, need to switch back to chromium
	if (browserType === 'chrome') {
		browserType = 'chromium'
	}
	const browser = await playwright[browserType].connect({
		wsEndpoint,
	})

	const page = await browser.newPage()

	return new PlaywrightClient(browser, page)
}

export async function launch(
	passedOptions: Partial<ConcreteLaunchOptions> = {},
	pageSettings: ConcreteTestSettings
): Promise<PlaywrightClient> {
	const options: ConcreteLaunchOptions = {
		...defaultLaunchOptions,
		...passedOptions,
	}

	// due to the errors "Cannot parse arguments: Unknown option ..." when running a test with webkit browser
	if (options.browser !== 'webkit') {
		options.args.push('--disable-gpu')
		options.args.push('--disable-dev-shm-usage')
		options.args.push('--auth-server-whitelist="hostname/domain"')
	}

	//just keep this option for chrome/chromium
	if (!options.sandbox && ['chrome', 'chromium'].includes(options.browser)) {
		options.args.push('--no-sandbox')
	}

	let browserType: BrowserType = options.executablePath ? 'chromium' : options.browser || 'chromium'

	if (browserType === 'chrome') {
		browserType = 'chromium'
		switch (process.platform) {
			case 'darwin':
				options.executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
				break
			case 'win32':
				options.executablePath = 'C:/Program Files (x86)/GoogleChrome/Applicationchrome.exe'
				break
			default:
				options.executablePath = '/usr/bin/google-chrome-stable'
		}
	}

	const browser = await playwright[browserType].launch(options).catch((err) => {
		console.log(chalk.redBright(err.message))
		return browser
	})
	const page = await browser.newPage(pageSettings)
	return new PlaywrightClient(browser, page)
}

export class NullPlaywrightClient implements PlaywrightClientLike {
	public browser: Browser
	public page: Page

	async close(): Promise<void> {
		return
	}

	async reopenPage(): Promise<void> {
		return
	}

	async closePages(): Promise<void> {
		return
	}

	isFirstRun(): boolean {
		return false
	}
}
