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
	description: 'Quickstart Demo App - SAP',
	actionDelay: '3.5s',
	stepDelay: '3.5s',
	clearCache: true,
	disableCache: true,
	clearCookies: true,
	chromeVersion: 'stable',
	waitTimeout: '60s',
}

/**
 * SAP - Bulletin Board Demo App
 * https://sapui5.hana.ondemand.com/test-resources/sap/m/demokit/tutorial/testing/14/webapp/test/mockServer.html
 * Authored by Jason Rizio (jason@flood.io)
 * Version: 1.0
 */
export default () => {
	step('Bulletin Board Demo App: Home', async browser => {
		//Navigate to the Bulleting Board Demo Application
		await browser.visit(
			'https://sapui5.hana.ondemand.com/test-resources/sap/m/demokit/tutorial/testing/14/webapp/test/mockServer.html',
		)

		//Verify that we are on the correct page by checking that 'Bulleting Board' text is shown on the page
		const pageTextVerify = By.visibleText('Bulletin Board')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

		//Take a screenshot
		await browser.takeScreenshot()
	})

	step('Bulletin Board Demo App: Click Item', async browser => {
		//Search the bulletin board list and type in 'Cheap Boat'
		let obj_itm_Boat = By.xpath("//span[contains(text(),'Cheap Boat')]")
		await browser.wait(Until.elementIsVisible(obj_itm_Boat))
		let element1 = await browser.findElement(obj_itm_Boat)
		await element1.click()

		//Verify that we are on the correct page by checking that 'Living close to a lake or the ocean?' text is shown on the page
		const pageTextVerify = By.visibleText('Living close to a lake or the ocean?')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

		//Take a screenshot
		await browser.takeScreenshot()
	})

	step('Bulletin Board Demo App: Click Views', async browser => {
		//Click on the Views filter icon
		let obj_btn_Views = By.xpath("//span[contains(@id, 'filter1-icon')]")
		await browser.wait(Until.elementIsVisible(obj_btn_Views))
		let element1 = await browser.findElement(obj_btn_Views)
		await element1.click()

		//Verify that we are on the correct page by checking that 'Viewed' text is shown on the page
		const pageTextVerify = By.visibleText('Viewed')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

		//Take a screenshot
		await browser.takeScreenshot()
	})
}
