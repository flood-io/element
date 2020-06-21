import playwright, { LaunchOptions, Browser, Page } from 'playwright'

export enum BROWSER_TYPE {
	CHROME = 'chromium',
	FIREFOX = 'firefox',
	SAFARI = 'webkit',
}

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
}

export class PlaywrightClient implements PlaywrightClientLike {
	constructor(public browser: Browser, public page: Page) {}

	private _isClosed = false
	private firstRun = true

	async close(): Promise<void> {
		if (this._isClosed) return
		await this.browser.close()
		this._isClosed = true
	}

	async reopenPage(incognito = false): Promise<void> {
		if (this.firstRun) {
			this.firstRun = false
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

export async function launch(
	passedOptions: Partial<ConcreteLaunchOptions> = {},
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
	const page = await browser.newPage()

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
}
