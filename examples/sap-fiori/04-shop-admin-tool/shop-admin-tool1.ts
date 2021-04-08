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
	description: 'Shop Administration Tool - SAP',
	actionDelay: '3.5s',
	stepDelay: '3.5s',
	clearCache: true,
	disableCache: true,
	clearCookies: true,
	chromeVersion: 'stable',
	waitTimeout: '60s',
}

/**
 * SAP - Shop Admin Tool Demo App
 * https://sapui5.hana.ondemand.com/test-resources/sap/tnt/demokit/toolpageapp/webapp/index.html
 * Authored by Jason Rizio (jason@flood.io)
 * Version: 1.0
 */
export default () => {
	step('Shop Admin Tool Demo App: Home', async (browser) => {
		//Navigate to demo app page
		await browser.visit(
			'https://sapui5.hana.ondemand.com/test-resources/sap/tnt/demokit/toolpageapp/webapp/index.html'
		)

		//verify that we are on the correct page and also do a page text check
		const pageTextVerify = By.visibleText('Shop Administration Tool')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

		//take a screenshot
		await browser.takeScreenshot()
	})

	step('Shop Admin Tool Demo App: Settings', async (browser) => {
		//Click the Setting sub menu
		const obj_mnu_Settings = By.xpath("//span[contains(text(),'Settings')]")
		await browser.wait(Until.elementIsVisible(obj_mnu_Settings))
		const element1 = await browser.findElement(obj_mnu_Settings)
		await element1.click()

		//verify that we are on the correct page and also do a page text check
		const pageTextVerify = By.visibleText('Here you can configure your application')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

		//take a screenshot
		await browser.takeScreenshot()
	})

	step('Shop Admin Tool Demo App: Click Home', async (browser) => {
		//click the Home link
		const obj_mnu_Home = By.xpath("//span[contains(text(),'Home')]")
		await browser.wait(Until.elementIsVisible(obj_mnu_Home))
		const element1 = await browser.findElement(obj_mnu_Home)
		await element1.click()

		//verify that we are on the correct page and also do a page text check
		const pageTextVerify = By.visibleText('Customer Overview')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

		//take a screenshot
		await browser.takeScreenshot()
	})

	step('Shop Admin Tool Demo App: Click Table Row', async (browser) => {
		//Click the table row that contains the name Jac
		const obj_tblrow_Jack = By.xpath("//span[contains(text(),'Jack')]")
		await browser.wait(Until.elementIsVisible(obj_tblrow_Jack))
		const element1 = await browser.findElement(obj_tblrow_Jack)
		await element1.click()

		//verify that we are on the correct page and also do a page text check
		const pageTextVerify = By.visibleText('Customer Overview')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

		//take a screenshot
		await browser.takeScreenshot()
	})
}
