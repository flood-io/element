import chalk from 'chalk'
import { BrowserType } from '../page/types'

export const browserTypes: string[] = ['chromium', 'firefox', 'webkit']

export const isCorrectBrowserType = (browser: string): browser is BrowserType =>
	browserTypes.includes(browser)

export const checkBrowserType = (browser: string): void => {
	if (!isCorrectBrowserType(browser)) {
		console.warn(
			chalk.yellow.bold(
				`The given browser type '${browser}' must be one in 'chromium', 'firefox', and 'webkit'.\n  Running test scripts with default browser type is 'chromium'.\n`,
			),
		)
	}
}
