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
	description: 'Worklist Demo App - SAP',
	actionDelay: '3.5s',
	stepDelay: '3.5s',
	clearCache: true,
	disableCache: true,
	clearCookies: true,
	chromeVersion: 'stable',
	waitTimeout: '60s',
}

/**
 * SAP - Worklist Demo App
 * https://sapui5.hana.ondemand.com/test-resources/sap/m/demokit/worklist/webapp/test/mockServer.html
 * Authored by Jason Rizio (jason@flood.io)
 * Version: 1.0
 */
export default () => {
	step('Worklist Demo App: Home', async (browser) => {
		//Navigate to the Quickstart Demo Application
		await browser.visit(
			'https://sapui5.hana.ondemand.com/test-resources/sap/m/demokit/worklist/webapp/test/mockServer.html'
		)

		//Verify that we are on the correct page by checking that '<Objects>' text is shown on the page
		const pageTextVerify = By.visibleText('<Objects>')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

		//Take a screenshot
		await browser.takeScreenshot()
	})

	step('Worklist Demo App: Search Worklist', async (browser) => {
		const page = browser.page

		//Search the worklist and type in 'Object 19'
		const obj_txt_SearchAnalysisType = By.xpath("//input[contains(@placeholder, 'Search')]")
		await browser.wait(Until.elementIsVisible(obj_txt_SearchAnalysisType))
		await browser.type(obj_txt_SearchAnalysisType, 'Object 19')

		//After typing in Object 19 - press the Enter key
		await page.keyboard.press('Enter')

		//Verify that we are on the correct page by checking that 'Object 19' text is shown on the page
		const pageTextVerify = By.visibleText('Object 19')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

		//Take a screenshot
		await browser.takeScreenshot()
	})

	step('Worklist Demo App: Select Worklist', async (browser) => {
		//Select worklist item 'Object 19'
		const obj_span_WorklistItem = By.xpath("//span[contains(text(),'Object 19')]")
		await browser.wait(Until.elementIsVisible(obj_span_WorklistItem))
		const element1 = await browser.findElement(obj_span_WorklistItem)
		await element1.click()

		//Verify that we are on the correct page by checking that '560.00' text is shown on the page
		const pageTextVerify = By.visibleText('560.00')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

		//Take a screenshot
		await browser.takeScreenshot()
	})
}
