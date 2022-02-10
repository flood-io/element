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
	description: 'Key User Adaptation - SAP',
	actionDelay: '3.5s',
	stepDelay: '3.5s',
	clearCache: true,
	disableCache: true,
	clearCookies: true,
	chromeVersion: 'stable',
	waitTimeout: '60s',
}

/**
 * SAP - Key User Adaptation Demo App
 * https://sapui5.hana.ondemand.com/test-resources/sap/ui/demoapps/demokit/rta/freestyle/test/flpSandbox.html#masterDetail-display&/product/HT-1000
 * Authored by Jason Rizio (jason@flood.io)
 * Version: 1.0
 */
export default () => {
	step('Key User Adaptation Demo App: Home', async (browser) => {
		//navigate to demo app page
		await browser.visit(
			'https://sapui5.hana.ondemand.com/test-resources/sap/ui/demoapps/demokit/rta/freestyle/test/flpSandbox.html#masterDetail-display&/product/HT-1000'
		)

		//verify that we are on the correct page and also do a page text check
		const pageTextVerify = By.visibleText('Product')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

		//take a screenshot
		await browser.takeScreenshot()
	})

	step('Key User Adaptation Demo App: Click Item 1', async (browser) => {
		//Select the ITelO Vault item
		const obj_item_ITelOVault = By.xpath("//span[contains(text(),'ITelO Vault')]")
		await browser.wait(Until.elementIsVisible(obj_item_ITelOVault))
		const element1 = await browser.findElement(obj_item_ITelOVault)
		await element1.click()

		//verify that we are on the correct page and also do a page text check
		const pageTextVerify = By.visibleText(
			'Digital Organizer with State-of-the-Art Storage Encryption'
		)
		await browser.wait(Until.elementIsVisible(pageTextVerify))

		//take a screenshot
		await browser.takeScreenshot()
	})

	step('Key User Adaptation Demo App: Click Item 2', async (browser) => {
		//Select the Comfort Easy item
		obj_item_ComfortEasy = By.xpath("//span[contains(text(),'Comfort Easy')]")
		await browser.wait(Until.elementIsVisible(obj_item_ComfortEasy))
		const element1 = await browser.findElement(obj_item_ComfortEasy)
		await element1.click()

		//verify that we are on the correct page and also do a page text check
		const pageTextVerify = By.visibleText(
			'32 GB Digital Assistant with high-resolution color screen'
		)
		await browser.wait(Until.elementIsVisible(pageTextVerify))

		//take a screenshot
		await browser.takeScreenshot()
	})
}
