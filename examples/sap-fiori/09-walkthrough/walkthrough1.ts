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
	description: 'Walkthrough Demo App - SAP',
	actionDelay: '3.5s',
	stepDelay: '3.5s',
	clearCache: true,
	disableCache: true,
	clearCookies: true,
	chromeVersion: 'stable',
	waitTimeout: '60s',
}

/**
 * SAP - Walkthrough Demo App
 * https://sapui5.hana.ondemand.com/test-resources/sap/m/demokit/tutorial/walkthrough/38/webapp/test/mockServer.html
 * Authored by Jason Rizio (jason@flood.io)
 * Version: 1.0
 */
export default () => {
	step('Walkthrough Demo App: Home', async browser => {
		await browser.visit(
			'https://sapui5.hana.ondemand.com/test-resources/sap/m/demokit/tutorial/walkthrough/38/webapp/test/mockServer.html',
		)

		const pageTextVerify = By.visibleText('Hello World')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

		await browser.takeScreenshot()
	})

	step('Walkthrough Demo App: Click Open Dialog', async browser => {
		//tpress the say hello with dialog button
		let obj_bdo_SayHello = By.xpath("//bdi[contains(text(),'Say Hello With Dialog')]")
		await browser.wait(Until.elementIsVisible(obj_bdo_SayHello))
		let element1 = await browser.findElement(obj_bdo_SayHello)
		await element1.click()

		const pageTextVerify = By.visibleText('Hello World')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

		let obj_bdi_ok = By.xpath("//bdi[contains(text(),'Ok')]")
		await browser.wait(Until.elementIsVisible(obj_bdi_ok))
		let element2 = await browser.findElement(obj_bdi_ok)
		await element2.click()

		await browser.takeScreenshot()
	})

	step('Walkthrough Demo App: Select Worklist', async browser => {
		const page = browser.page

		let obj_txt_SayHello = By.css('#__input0-inner')
		await browser.wait(Until.elementIsVisible(obj_txt_SayHello))
		await page.focus('#__input0-inner')
		await page.keyboard.press('End')
		page.type('#__input0-inner', ' Flood Element 123', { delay: 200 }) // Types slower, like a user

		let obj_lbl_CustomText = By.xpath("//div[contains(text(),'World Flood Element 123')]")
		await browser.wait(Until.elementIsVisible(obj_lbl_CustomText))

		await browser.takeScreenshot()
	})

	step('Walkthrough Demo App: Select Invoice Item', async browser => {
		let obj_span_milk = By.xpath("//span[contains(text(),'Canned Beans')]")
		await browser.wait(Until.elementIsVisible(obj_span_milk))
		let element1 = await browser.findElement(obj_span_milk)
		await element1.click()

		//Please rate this product
		const pageTextVerify = By.visibleText('Please rate this product')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

		await browser.takeScreenshot()
	})
}
