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
	actionDelay: '1.5s',
	stepDelay: '1.5s',
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
	step('APF demo app: Home', async browser => {
		await browser.visit(
			'https://sapui5.hana.ondemand.com/test-resources/sap/apf/newDemokit/runtime/index.html',
		)

		const pageTextVerify = By.visibleText('APF Standard Demo')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

		await browser.takeScreenshot()
	})

	step('APF demo app: Add Analysis Step', async browser => {
		//obj_btn_AddAnalysisStep
		let obj_btn_AddAnalysisStep = By.css('#__jsview5--idAddAnalysisStepButton-BDI-content')
		await browser.wait(Until.elementIsVisible(obj_btn_AddAnalysisStep))
		let element1 = await browser.findElement(obj_btn_AddAnalysisStep)
		await element1.click()

		const pageTextVerify = By.visibleText('Category')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

		await browser.takeScreenshot()
	})

	step('APF demo app: Search and Select Analysis Type', async browser => {
		//__field5-I
		let obj_txt_SearchAnalysisType = By.xpath("//input[contains(@placeholder, 'Search')]")
		await browser.wait(Until.elementIsVisible(obj_txt_SearchAnalysisType))
		await browser.type(obj_txt_SearchAnalysisType, 'Revenue')

		//Select first result called 'Revenue'
		let obj_div_RevenueItem = By.xpath("//div[contains(text(),'Revenue')]")
		await browser.wait(Until.elementIsVisible(obj_div_RevenueItem))
		let element1 = await browser.findElement(obj_div_RevenueItem)
		await element1.click()

		//Select another result called
		let obj_div_RevenueOverTime = By.xpath("//div[contains(text(),'Revenue over Time')]")
		await browser.wait(Until.elementIsVisible(obj_div_RevenueOverTime))
		let element2 = await browser.findElement(obj_div_RevenueOverTime)
		await element2.click()

		//Select Line Chart with Time Axis item
		let obj_div_LineChartItem = By.xpath("//div[contains(text(),'Line Chart with Time Axis')]")
		await browser.wait(Until.elementIsVisible(obj_div_LineChartItem))
		let element3 = await browser.findElement(obj_div_LineChartItem)
		await element3.click()

		await browser.takeScreenshot()
	})

	step('APF demo app: Verify Graph Added', async browser => {
		const pageTextVerify = By.visibleText('Revenue over Time')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

		await browser.takeScreenshot()
	})
}
