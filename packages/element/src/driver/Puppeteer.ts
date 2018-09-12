import { launch as launchPuppeteer, LaunchOptions, Browser, Page } from 'puppeteer'
import { ChromeVersion } from '../runtime/Settings'

export type ConcreteLaunchOptions = LaunchOptions & {
	args: string[]
	chromeVersion: ChromeVersion | string
	sandbox: boolean
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

function setupSystemChrome(options: ConcreteLaunchOptions): ConcreteLaunchOptions {
	switch (process.platform) {
		case 'darwin':
			options.executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
			break
		default:
			// TODO search PATH for chrome
			options.executablePath = '/usr/bin/google-chrome-stable'
	}
	options.args.push('--disable-gpu')
	options.args.push('--disable-dev-shm-usage')

	return options
}

export interface IPuppeteerClient {
	browser: Browser
	page: Page
	close(): Promise<void>
}

export class PuppeteerClient implements IPuppeteerClient {
	constructor(public browser: Browser, public page: Page) {}

	private _isClosed = false
	async close(): Promise<void> {
		if (this._isClosed) return
		await this.browser.close()
		this._isClosed = true
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

	options = setupChrome(options)

	// console.log(JSON.stringify(options, null, 2))
	// console.log('Runner launching client', options)
	// const browser = await launchPuppeteer(options)
	// console.log('whyyy')
	// const page = await browser.newPage()

	// console.log('Runner building client...')
	// return new PuppeteerClient(browser, page)

	// console.log('puppeteer launching client...')
	// return launchPuppeteer(options).then(browser =>
	// browser.newPage().then(page => new PuppeteerClient(browser, page)),
	// )

	const browser = await launchPuppeteer(options)
	const page = await browser.newPage()

	return new PuppeteerClient(browser, page)
}

export class NullPuppeteerClient implements IPuppeteerClient {
	public browser: Browser
	public page: Page
	constructor() {}
	async close(): Promise<void> {
		return
	}
}
