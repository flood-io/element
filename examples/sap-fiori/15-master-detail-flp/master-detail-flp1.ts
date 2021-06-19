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
	description: 'Master Detail - FLP - SAP',
	actionDelay: '3.5s',
	stepDelay: '3.5s',
	clearCache: true,
	disableCache: true,
	clearCookies: true,
	chromeVersion: 'stable',
	waitTimeout: '60s',
}

/**
 * SAP - Master Detail - FLP Demo App
 * https://sapui5.hana.ondemand.com/test-resources/sap/ui/demoapps/demokit/master-detail/webapp/test/flpSandboxMockServer.html#MasterDetail-display
 * Authored by Jason Rizio (jason@flood.io)
 * Version: 1.0
 */
export default () => {
	step('Master Detail FLP Demo App: Home', async (browser) => {
		await browser.visit(
			'https://sapui5.hana.ondemand.com/test-resources/sap/ui/demoapps/demokit/master-detail/webapp/test/flpSandboxMockServer.html#MasterDetail-display'
		)

		const pageTextVerify = By.visibleText('<Objects> (')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

		await browser.takeScreenshot()
	})

	step('Master Detail FLP Demo App: Search Worklist', async (browser) => {
		const page = browser.page

		//Search worklist
		const obj_txt_SearchAnalysisType = By.xpath("//input[contains(@placeholder, 'Search')]")
		await browser.wait(Until.elementIsVisible(obj_txt_SearchAnalysisType))
		await browser.type(obj_txt_SearchAnalysisType, 'Object 19')
		await page.keyboard.press('Enter')

		const pageTextVerify = By.visibleText('Object 19')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

		await browser.takeScreenshot()
	})

	step('Master Detail FLP Demo App: Select Worklist', async (browser) => {
		//Select worklist
		const obj_span_WorklistItem = By.xpath("//span[contains(text(),'Object 19')]")
		await browser.wait(Until.elementIsVisible(obj_span_WorklistItem))
		const element1 = await browser.findElement(obj_span_WorklistItem)
		await element1.click()

		const pageTextVerify = By.visibleText('560.00')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

		await browser.takeScreenshot()
	})
}
