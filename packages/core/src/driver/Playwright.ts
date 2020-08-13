import playwright, { LaunchOptions, Browser, Page, BrowserServer } from 'playwright'
import { ConcreteTestSettings } from '../runtime/Settings'
import { BROWSER_TYPE } from '../page/types'

export type ConcreteLaunchOptions = LaunchOptions & {
	args: string[]
	sandbox: boolean
	debug: boolean
	browserType: BROWSER_TYPE
	viewport: playwright.ViewportSize | null
	ignoreHTTPSError: boolean
}

const defaultLaunchOptions: ConcreteLaunchOptions = {
	args: [],
	handleSIGINT: false,
	headless: true,
	devtools: false,
	sandbox: true,
	timeout: 60e3,
	debug: false,
	browserType: BROWSER_TYPE.CHROME,
	viewport: null,
	ignoreHTTPSError: false,
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
		const pages = await this.page.context().pages()
		for (const page of pages) {
			await page.close()
		}
	}
}

export async function launchBrowserServer(
	passedOptions: Partial<ConcreteLaunchOptions> = {},
): Promise<BrowserServer> {
	const options: ConcreteLaunchOptions = {
		...defaultLaunchOptions,
		...passedOptions,
	}

	if (!options.sandbox) {
		options.args.push('--no-sandbox')
	}

	if (options.debug) {
		console.dir(options)
	}

	options.args.push('--auth-server-whitelist="hostname/domain"')

	const browserType = options.browserType || BROWSER_TYPE.CHROME
	return playwright[browserType].launchServer(options)
}

export async function connectWS(wsEndpoint: string, type?: BROWSER_TYPE) {
	const browserType = type || BROWSER_TYPE.CHROME
	const browser = await playwright[browserType].connect({
		wsEndpoint,
	})

	const page = await browser.newPage()

	return new PlaywrightClient(browser, page)
}

export async function launch(
	passedOptions: Partial<ConcreteLaunchOptions> = {},
	pageSettings: ConcreteTestSettings,
): Promise<PlaywrightClient> {
	const options: ConcreteLaunchOptions = {
		...defaultLaunchOptions,
		...passedOptions,
	}

	options.args.push('--disable-gpu')
	options.args.push('--disable-dev-shm-usage')

	if (!options.sandbox) {
		options.args.push('--no-sandbox')
	}

	if (options.debug) {
		console.dir(options)
	}

	options.args.push('--auth-server-whitelist="hostname/domain"')

	const browserType = options.browserType || BROWSER_TYPE.CHROME
	const browser = await playwright[browserType].launch(options)
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
