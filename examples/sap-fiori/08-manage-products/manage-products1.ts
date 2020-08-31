import { step, TestSettings, Until, By, MouseButtons, Device, Driver, ENV, Key } from '@flood/element'
import * as assert from 'assert'

export const settings: TestSettings = {
  loopCount: -1,
  screenshotOnFailure: true,
  description: 'Manage Products Demo App - SAP',
  actionDelay: 3.5,
  stepDelay: 3.5,
  clearCache: true,	
  disableCache: true,
  clearCookies: true,
  chromeVersion: 'stable',
  waitTimeout: 60,
}

/**
 * SAP - Manage Products Demo App
 * https://sapui5.hana.ondemand.com/test-resources/sap/m/demokit/tutorial/worklist/07/webapp/test/mockServer.html
 * Authored by Jason Rizio (jason@flood.io)
 * Version: 1.0
 */
export default () => {

  step('Manage Products Demo App: Home', async browser => {

    //Navigate to the Manage Products Demo Application
    await browser.visit('https://sapui5.hana.ondemand.com/test-resources/sap/m/demokit/tutorial/worklist/07/webapp/test/mockServer.html')

    //Verify that we are on the correct page by checking that 'Products' text is shown on the page
    const pageTextVerify = By.visibleText('Products (')
    await browser.wait(Until.elementIsVisible(pageTextVerify))

    //Take a screenshot
    await browser.takeScreenshot()
  })

  step('Manage Products Demo App: Select Checkbox', async browser => {
    
    //tick checkbox
    let obj_chkbox_Item = By.xpath("//div[contains(@data-sap-ui, 'clone1')]")
    await browser.wait(Until.elementIsVisible(obj_chkbox_Item))
    let element1 = await browser.findElement(obj_chkbox_Item)
    await element1.click() 

    const pageTextVerify = By.visibleText("Aniseed Syrup")
    await browser.wait(Until.elementIsVisible(pageTextVerify))

    await browser.takeScreenshot()
  })
  
  step('Manage Products Demo App: Select Worklist', async browser => {

    
    //Select worklist
    let obj_span_Item = By.xpath("//span[contains(text(),'Aniseed Syrup')]")
    await browser.wait(Until.elementIsVisible(obj_span_Item))
    let element1 = await browser.findElement(obj_span_Item)
    await element1.click() 

    const pageTextVerify = By.visibleText('707 Oxford Rd.')
    await browser.wait(Until.elementIsVisible(pageTextVerify))

    await browser.takeScreenshot()
  })

  



  
}
