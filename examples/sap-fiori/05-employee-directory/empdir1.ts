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
	description: 'Employee Directory Demo App - SAP',
	actionDelay: '3.5s',
	stepDelay: '3.5s',
	clearCache: true,
	disableCache: true,
	clearCookies: true,
	chromeVersion: 'stable',
	waitTimeout: '60s',
}

/**
 * SAP - Employee Directory Demo App
 * https://sapui5.hana.ondemand.com/test-resources/sap/ui/core/demokit/tutorial/navigation/09/webapp/index.html#/employees
 * Authored by Jason Rizio (jason@flood.io)
 * Version: 1.0
 */
export default () => {
	step('Employee Directory Demo App: Home', async browser => {
		//Navigate to the Employee Directory Demo Application
		await browser.visit(
			'https://sapui5.hana.ondemand.com/test-resources/sap/ui/core/demokit/tutorial/navigation/09/webapp/index.html#/employees',
		)

		//Verify that we are on the correct page by checking that 'Employee List' text is shown on the page
		const pageTextVerify = By.visibleText('Employee List')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

		//Take a screenshot
		await browser.takeScreenshot()
	})

	step('Employee Directory Demo App: Click Robert King', async browser => {
		//Click on the text link item called 'Robert King'
		let obj_itm_RobertKing = By.xpath("//div[contains(text(),'Robert King')]")
		await browser.wait(Until.elementIsVisible(obj_itm_RobertKing))
		let element1 = await browser.findElement(obj_itm_RobertKing)
		await element1.click()

		//Verify that we are on the correct page by checking that 'Employee Details of Robert King' text is shown on the page
		const pageTextVerify = By.visibleText('Employee Details of Robert King')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

		//Take a screenshot
		await browser.takeScreenshot()
	})

	step('Employee Directory Demo App: Flip to Resume', async browser => {
		//Click on the text link item called 'Flip to Resume'
		let obj_itm_FlipToResume = By.xpath("//a[contains(text(),'Flip to Resume')]")
		await browser.wait(Until.elementIsVisible(obj_itm_FlipToResume))
		let element1 = await browser.findElement(obj_itm_FlipToResume)
		await element1.click()

		//Verify that we are on the correct page by checking that 'Information of Robert King' text is shown on the page
		const pageTextVerify = By.visibleText('Information of Robert King')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

		//Take a screenshot
		await browser.takeScreenshot()
	})

	step('Employee Directory Demo App: Hobbies Link', async browser => {
		//Click on the text link item called 'Hobbies'
		let obj_div_Hobbies = By.xpath("//div[contains(text(),'Hobbies')]")
		await browser.wait(Until.elementIsVisible(obj_div_Hobbies))
		let element1 = await browser.findElement(obj_div_Hobbies)
		await element1.click()

		//Verify that we are on the correct page by checking that 'Hobbies of Robert King' text is shown on the page
		const pageTextVerify = By.visibleText('Hobbies of Robert King')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

		//Take a screenshot
		await browser.takeScreenshot()
	})
}
