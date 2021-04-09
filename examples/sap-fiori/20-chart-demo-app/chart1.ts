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
	description: 'Chart Demo App - SAP',
	actionDelay: '1.5s',
	stepDelay: '1.5s',
	clearCache: true,
	disableCache: true,
	clearCookies: true,
	chromeVersion: 'stable',
	waitTimeout: '60s',
}

/**
 * SAP - Chart Demo App
 * Authored by Jason Rizio (jason@flood.io)
 * Version: 1.0
 */
export default () => {
	step('SAP viz chart demo: Home', async (browser) => {
		await browser.visit(
			'https://sapui5.hana.ondemand.com/test-resources/sap/viz/demokit/chartdemo/index.html'
		)

		const pageTextVerify = By.visibleText('Revenue by Item Category')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

		await browser.takeScreenshot()
	})

	step('SAP viz chart demo: Chart Config', async (browser) => {
		//uncheck profit checkbox
		const obj_chk_Profit = By.xpath("//div[contains(@id, 'Profit-selectMulti-CbBg')]")
		await browser.wait(Until.elementIsVisible(obj_chk_Profit))
		const element1 = await browser.findElement(obj_chk_Profit)
		await element1.click()

		//select chart type
		const obj_dropdown_ChartType = By.css('#__xmlview0--select-label')
		await browser.wait(Until.elementIsVisible(obj_dropdown_ChartType))
		const element2 = await browser.findElement(obj_dropdown_ChartType)
		await element2.click()

		//#__item1
		const obj_ChartType_Line = By.css('#__item1')
		await browser.wait(Until.elementIsVisible(obj_ChartType_Line))
		const element3 = await browser.findElement(obj_ChartType_Line)
		await element3.click()

		const pageTextVerify = By.visibleText('419,630.09')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

		await browser.takeScreenshot()
	})

	step('SAP viz chart demo: Chart Popover', async (browser) => {
		//select chart popover type
		const obj_dropdown_PopoverType = By.css('#__xmlview0--selectPopover-label')
		await browser.wait(Until.elementIsVisible(obj_dropdown_PopoverType))
		const element1 = await browser.findElement(obj_dropdown_PopoverType)
		await element1.click()

		//#__item7
		const obj_PopoverType_Custom = By.css('#__item7')
		await browser.wait(Until.elementIsVisible(obj_PopoverType_Custom))
		const element2 = await browser.findElement(obj_PopoverType_Custom)
		await element2.click()

		//select a data point on the graph
		const obj_datapoint = By.css(
			'#UIComp_1 > svg > g.v-m-main > g.v-m-plot > g:nth-child(4) > g > g.v-datapoint-group > g:nth-child(2) > g:nth-child(2)'
		)
		await browser.wait(Until.elementIsVisible(obj_datapoint))
		const element3 = await browser.findElement(obj_datapoint)
		await element3.click()

		//select action item 3
		//sapMSLITitleOnly
		const strXPath = '//div[@class="sapMSLITitleOnly" and text() = "Action Item 2"]'
		const labelActionItem2 = await browser.findElement(By.xpath(strXPath))
		await labelActionItem2.click()

		await browser.takeScreenshot()
	})
}
