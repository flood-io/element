import { BrowserType } from '../page/types'

export const browserTypes: string[] = ['chromium', 'firefox', 'webkit']

export const isCorrectBrowserType = (browser: string): browser is BrowserType =>
	browserTypes.includes(browser)
