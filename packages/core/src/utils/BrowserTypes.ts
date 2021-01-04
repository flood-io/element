import chalk from 'chalk'
import { BrowserType } from '../page/types'

export const browserTypes: string[] = ['chromium', 'firefox', 'webkit']

export const isCorrectBrowserType = (browser: string): browser is BrowserType =>
	browserTypes.includes(browser)

export const checkBrowserType = (browser: string): void => {
	if (!isCorrectBrowserType(browser)) {
		console.warn(
			chalk.yellow.bold(
				`'${browser}' is not a valid option for --browser . Running with 'chromium' as the default.`,
			),
		)
	}
}
