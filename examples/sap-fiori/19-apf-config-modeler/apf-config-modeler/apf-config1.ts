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
	description: 'APF Demo App - SAP',
	actionDelay: '3.5s',
	stepDelay: '3.5s',
	clearCache: true,
	disableCache: true,
	clearCookies: true,
	chromeVersion: 'stable',
	waitTimeout: '60s',
}

/**
 * SAP - APF Demo App
 * https://sapui5.hana.ondemand.com/test-resources/sap/apf/newDemokit/runtime/index.html
 * Authored by Jason Rizio (jason@flood.io)
 * Version: 1.0
 */
export default () => {
	step('APF Config Modeler Demo App: Home', async (browser) => {
		await browser.visit(
			'https://sapui5.hana.ondemand.com/test-resources/sap/apf/newDemokit/modeler/index.html'
		)

		const pageTextVerify = By.visibleText('APF Demo Kit Application')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

		await browser.takeScreenshot()
	})

	step('APF Config Modeler Demo App: Select Application', async (browser) => {
		//Select first result called 'Revenue'
		const obj_span_APFDemoKitApp = By.xpath("//span[contains(text(),'APF Demo Kit Application')]")
		await browser.wait(Until.elementIsVisible(obj_span_APFDemoKitApp))
		const element1 = await browser.findElement(obj_span_APFDemoKitApp)
		await element1.click()

		const pageTextVerify = By.visibleText('Configuration Object of Application')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

		await browser.takeScreenshot()
	})

	step('APF Config Modeler Demo App: Select Tree Item', async (browser) => {
		//APF Standard Demo
		const obj_span_TreeAPFStandardDemo = By.xpath("//span[contains(text(),'APF Standard Demo')]")
		await browser.wait(Until.elementIsVisible(obj_span_TreeAPFStandardDemo))
		const element1 = await browser.findElement(obj_span_TreeAPFStandardDemo)
		await element1.click()

		const pageTextVerify = By.visibleText('Configuration Data')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

		await browser.takeScreenshot()
	})

	step('APF Config Modeler Demo App: Select Currency Filter', async (browser) => {
		//Choose Filter
		const obj_span_Filters = By.xpath("//span[contains(text(),'Filters')]")
		await browser.wait(Until.elementIsVisible(obj_span_Filters))
		const element1 = await browser.findElement(obj_span_Filters)
		await element1.click()

		await browser.wait('2s')

		//Choose Currency Filter
		const obj_span_CurrencyFilter = By.xpath("//span[contains(text(),'Currency')]")
		await browser.wait(Until.elementIsVisible(obj_span_CurrencyFilter))
		const element2 = await browser.findElement(obj_span_CurrencyFilter)
		await element2.click()

		const pageTextVerify = By.visibleText('Basic Data')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

		await browser.takeScreenshot()
	})

	step('APF Config Modeler Demo App: Change Filter Name', async (browser) => {
		const page = browser.page

		//Choose Filter
		const obj_span_Filters = By.xpath("//span[contains(text(),'Filters')]")
		await browser.wait(Until.elementIsVisible(obj_span_Filters))
		const element1 = await browser.findElement(obj_span_Filters)
		await element1.click()

		//enter new filter name
		await page.focus('#__xmlview7--idLabel-inner')
		await page.keyboard.press('End')
		await page.keyboard.type('123')
		//page.type('#__xmlview7--idLabel-inner', 'Currency123', {delay: 200}); // Types slower, like a user

		const pageTextVerify = By.visibleText('Basic Data')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

		await browser.takeScreenshot()
	})
}
