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
	description: 'Key User Adaptation - Fiori Elements - SAP',
	actionDelay: '3.5s',
	stepDelay: '3.5s',
	clearCache: true,
	disableCache: true,
	clearCookies: true,
	chromeVersion: 'stable',
	waitTimeout: '60s',
}

/**
 * SAP - Key User Adaptation - Fiori Elements Demo App
 * https://sapui5.hana.ondemand.com/test-resources/sap/ui/demoapps/demokit/rta/fiori-elements/test/index.html#masterDetail-display
 * Authored by Jason Rizio (jason@flood.io)
 * Version: 1.0
 */
export default () => {
	step('Key User Adaptation Fiori Demo App: Home', async (browser) => {
		//Navigate to demo app page
		await browser.visit(
			'https://sapui5.hana.ondemand.com/test-resources/sap/ui/demoapps/demokit/rta/fiori-elements/test/index.html#masterDetail-display'
		)

		//verify that we are on the correct page and also do some page text checks
		const pageTextVerify = By.visibleText('Products (')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

		//take a screenshot
		await browser.takeScreenshot()
	})

	step('Key User Adaptation Fiori Demo App: Lookup', async (browser) => {
		//click the 'lookup' button next to the Supplier input entry
		const obj_txt_Lookup = By.xpath("//span[contains(@id, 'Supplier-multiinput')]")
		await browser.wait(Until.elementIsVisible(obj_txt_Lookup))
		const element1 = await browser.findElement(obj_txt_Lookup)
		await element1.click()

		//verify that we are on the correct page and also do some page text checks
		const pageTextVerify = By.visibleText('Select Supplier')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

		//take a screenshot
		await browser.takeScreenshot()
	})

	step('Key User Adaptation Fiori Demo App: Choose Supplier', async (browser) => {
		//select the supplier called AVANTEL
		const obj_itm_Supplier = By.xpath("//span[contains(text(),'AVANTEL')]")
		await browser.wait(Until.elementIsVisible(obj_itm_Supplier))
		const element1 = await browser.findElement(obj_itm_Supplier)
		await element1.click()

		//verify that we are on the correct page and also do a page text check
		const pageTextVerify = By.visibleText('Select Supplier')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

		//take a screenshot
		await browser.takeScreenshot()
	})

	step('Key User Adaptation Fiori Demo App: OK Supplier', async (browser) => {
		//click OK to confirm the selected Supplier
		const obj_OK = By.xpath("//*[@id='__dialog0-ok-BDI-content']")
		await browser.wait(Until.elementIsVisible(obj_OK))
		const element1 = await browser.findElement(obj_OK)
		await element1.click()

		//verify that we are on the correct page and also do a page text check
		const pageTextVerify = By.visibleText('Products (')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

		//take a screenshot
		await browser.takeScreenshot()
	})

	step('Key User Adaptation Fiori Demo App: Search Supplier', async (browser) => {
		//click the search button
		const obj_btn_Search = By.xpath("//div[contains(@id, 'btnBasicSearch-search')]")
		await browser.wait(Until.elementIsVisible(obj_btn_Search))
		const element1 = await browser.findElement(obj_btn_Search)
		await element1.click()

		//verify that we are on the correct page and also do a page text check
		const pageTextVerify = By.visibleText('Family PC Pro')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

		//take a screenshot
		await browser.takeScreenshot()
	})

	step('Key User Adaptation Fiori Demo App: Select Product', async (browser) => {
		//select the Family PC Pro item
		const obj_itm_Product = By.xpath("//a[contains(text(),'Family PC Pro')]")
		await browser.wait(Until.elementIsVisible(obj_itm_Product))
		const element1 = await browser.findElement(obj_itm_Product)
		await element1.click()

		//verify that we are on the correct page and also do a page text check
		const pageTextVerify = By.visibleText('Notebook Basic 15 with')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

		//take a screenshot
		await browser.takeScreenshot()
	})

	step('Key User Adaptation Fiori Demo App: Click Reviews', async (browser) => {
		//click on the Reviews sub-section link
		const obj_itm_Product = By.xpath("//bdi[contains(text(),'Reviews')]")
		await browser.wait(Until.elementIsVisible(obj_itm_Product))
		const element1 = await browser.findElement(obj_itm_Product)
		await element1.click()

		//verify that we are on the correct page and also do a page text check
		const pageTextVerify = By.visibleText('Abhorreant eloquentiam eam')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

		//take a screenshot
		await browser.takeScreenshot()
	})
}
