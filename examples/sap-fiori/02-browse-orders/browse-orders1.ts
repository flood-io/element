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
 * SAP - Browse Orders Demo App
 * https://sapui5.hana.ondemand.com/test-resources/sap/m/demokit/orderbrowser/webapp/test/mockServer.html
 * Authored by Jason Rizio (jason@flood.io)
 * Version: 1.0
 */
export default () => {
	step('Browse Orders Demo App: Home', async (browser) => {
		await browser.visit(
			'https://sapui5.hana.ondemand.com/test-resources/sap/m/demokit/orderbrowser/webapp/test/mockServer.html'
		)

		const pageTextVerify = By.visibleText('Orders')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

		await browser.takeScreenshot()
	})

	step('Browse Orders Demo App: Choose Order', async (browser) => {
		const obj_itm_Order = By.xpath("//span[contains(text(),'Order 7991')]")
		await browser.wait(Until.elementIsVisible(obj_itm_Order))
		const element1 = await browser.findElement(obj_itm_Order)
		await element1.click()

		const pageTextVerify = By.visibleText('Shipping Address')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

		await browser.takeScreenshot()
	})

	step('Browse Orders Demo App: Processor Info', async (browser) => {
		const obj_itm_ProcessorInfo = By.css(
			'#container-orderbrowser---detail--iconTabFilterProcessor-icon'
		)
		await browser.wait(Until.elementIsVisible(obj_itm_ProcessorInfo))
		const element1 = await browser.findElement(obj_itm_ProcessorInfo)
		await element1.click()

		const pageTextVerify = By.visibleText('Processor Information')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

		await browser.takeScreenshot()
	})
}
