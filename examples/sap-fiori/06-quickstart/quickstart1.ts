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
 * SAP - Quickstart Demo App
 * https://sapui5.hana.ondemand.com/test-resources/sap/m/demokit/tutorial/quickstart/03/webapp/index.html
 * Authored by Jason Rizio (jason@flood.io)
 * Version: 1.0
 */
export default () => {
	step('Quickstart Demo App: Home', async (browser) => {
		//Navigate to the Quickstart Demo Application
		await browser.visit(
			'https://sapui5.hana.ondemand.com/test-resources/sap/m/demokit/tutorial/quickstart/03/webapp/index.html'
		)

		//Verify that we are on the correct page by checking that 'My App' text is shown on the page
		const pageTextVerify = By.visibleText('My App')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

		//Take a screenshot
		await browser.takeScreenshot()
	})

	step('Quickstart Demo App: Click Go', async (browser) => {
		//Click on the text link item called 'Go!'
		const obj_btn_Go = By.xpath("//bdi[contains(text(),'Go!')]")
		await browser.wait(Until.elementIsVisible(obj_btn_Go))
		const element1 = await browser.findElement(obj_btn_Go)
		await element1.click()

		//Verify that we are on the correct page by checking that 'This is UI5!' text is shown on the page
		const pageTextVerify = By.visibleText('This is UI5!')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

		//Take a screenshot
		await browser.takeScreenshot()
	})

	step('Quickstart Demo App: Click Are You Ready?', async (browser) => {
		//Click on the graphical radio button selector called 'Are You Ready?'
		const obj_lnk_AreYouReady = By.xpath("//span[contains(@id, '__panel0-CollapsedImg')]")
		await browser.wait(Until.elementIsVisible(obj_lnk_AreYouReady))
		const element1 = await browser.findElement(obj_lnk_AreYouReady)
		await element1.click()

		//Verify that we are on the correct page by checking that 'no' text is shown on the page
		const pageTextVerify = By.visibleText('no')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

		//Take a screenshot
		await browser.takeScreenshot()
	})

	step('Quickstart Demo App: Click Switch to Yes', async (browser) => {
		//Click on the Switch button selector to the 'Yes' position
		const obj_btn_Yes = By.xpath("//span[contains(text(),'no')]")
		await browser.wait(Until.elementIsVisible(obj_btn_Yes))
		const element1 = await browser.findElement(obj_btn_Yes)
		await element1.click()

		//Verify that we are on the correct page by checking that 'Ok, let's get you started!' text is shown on the page
		const pageTextVerify = By.visibleText("Ok, let's get you started!")
		await browser.wait(Until.elementIsVisible(pageTextVerify))

		//Take a screenshot
		await browser.takeScreenshot()
	})

	step('Quickstart Demo App: Click Learn More Link', async (browser) => {
		//Click on the text link that has the text 'Learn more'
		const obj_lnk_LearnMore = By.xpath("//a[contains(text(),'Learn more')]")
		await browser.wait(Until.elementIsVisible(obj_lnk_LearnMore))
		const element1 = await browser.findElement(obj_lnk_LearnMore)
		await element1.click()

		//Verify that we are on the correct page by checking that 'Discover New Enterprise-Grade Horizons' text is shown on the page
		const pageTextVerify = By.visibleText('Discover New Enterprise-Grade Horizons')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

		//Take a screenshot
		await browser.takeScreenshot()
	})
}
