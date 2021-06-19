import {
	step,
	TestSettings,
	Until,
	By,
	MouseButtons,
	Device,
	Driver,
	ENV,
	Key,
} from '@flood/element'
import * as assert from 'assert'

export const settings: TestSettings = {
	loopCount: -1,
	screenshotOnFailure: true,
	description: 'Sales Orders Demo App - SAP',
	actionDelay: '3.5s',
	stepDelay: '3.5s',
	clearCache: true,
	disableCache: true,
	clearCookies: true,
	chromeVersion: 'stable',
	waitTimeout: '60s',
}

/**
 * SAP - Basic Template Demo App
 * https://sapui5.hana.ondemand.com/test-resources/sap/m/demokit/basicTemplate/webapp/index.html
 * Authored by Jason Rizio (jason@flood.io)
 * Version: 1.0
 */
export default () => {
	step('Sales Orders Demo App: Home', async (browser) => {
		//Navigate to the Basic Template Demo Application
		await browser.visit(
			'https://sapui5.hana.ondemand.com/test-resources/sap/m/demokit/basicTemplate/webapp/index.html'
		)

		//Verify that we are on the correct page by checking that 'Basic Template' text is shown on the page
		const pageTextVerify = By.visibleText('Basic Template')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

		//Take a screenshot
		await browser.takeScreenshot()
	})
}
