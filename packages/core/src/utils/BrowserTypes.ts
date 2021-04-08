import chalk from 'chalk'
import { BrowserType } from '../page/types'

export const browserTypes: string[] = ['chrome', 'chromium', 'firefox', 'webkit']

export const isCorrectBrowserType = (browser: string): browser is BrowserType =>
	browserTypes.includes(browser)

export const checkBrowserType = (browser: string | undefined): void => {
	if (browser && !isCorrectBrowserType(browser)) {
		console.warn(
			chalk.yellow.bold(
				`'${browser}' is not a valid option for --browser . Running with 'chromium' as the default.`
			)
		)
	}
}
