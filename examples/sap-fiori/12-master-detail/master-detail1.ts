import { step, TestSettings, Until, By, MouseButtons, Device, Driver, ENV, Key } from '@flood/element'
import * as assert from 'assert'

export const settings: TestSettings = {
  loopCount: -1,
  screenshotOnFailure: true,
  description: 'Master Detail Demo App - SAP',
  actionDelay: 3.5,
  stepDelay: 3.5,
  clearCache: true,	
  disableCache: true,
  clearCookies: true,
  chromeVersion: 'stable',
  waitTimeout: 60,
}

/**
 * SAP - Master/Detail Demo App
 * https://sapui5.hana.ondemand.com/test-resources/sap/m/demokit/master-detail/webapp/test/mockServer.html
 * Authored by Jason Rizio (jason@flood.io)
 * Version: 1.0
 */
export default () => {

  step('Master-Detail Demo App: Home', async browser => {
    
    //Navigate to the Master/Detail Demo Application
    await browser.visit('https://sapui5.hana.ondemand.com/test-resources/sap/m/demokit/master-detail/webapp/test/mockServer.html')

    //Verify that we are on the correct page by checking that '<Objects>' text is shown on the page
    const pageTextVerify = By.visibleText('<Objects>')
    await browser.wait(Until.elementIsVisible(pageTextVerify))

    //Take a screenshot
    await browser.takeScreenshot()
  })

  step('Master-Detail Demo App: Search', async browser => {

    const page = browser.page
    
    //Search the worklist and type in 'Object 8'
    let obj_txt_Search = By.xpath("//input[contains(@placeholder, 'Search')]")
    await browser.wait(Until.elementIsVisible(obj_txt_Search))
    await browser.type(obj_txt_Search, "Object 8")
    await page.keyboard.press('Enter')

    //After typing in Object 19 - press the Enter key
    const pageTextVerify = By.visibleText('Object 8')
    await browser.wait(Until.elementIsVisible(pageTextVerify))

    //Take a screenshot
    await browser.takeScreenshot()
  })
  
  step('Master-Detail Demo App: Select Master', async browser => {

    //Select worklist item 'Object 8'
    let obj_span_WorklistItem = By.xpath("//span[contains(text(),'Object 8')]")
    await browser.wait(Until.elementIsVisible(obj_span_WorklistItem))
    let element1 = await browser.findElement(obj_span_WorklistItem)
    await element1.click() 

    //Verify that we are on the correct page by checking that '<LineItemsPlural>' text is shown on the page
    const pageTextVerify = By.visibleText('<LineItemsPlural>')
    await browser.wait(Until.elementIsVisible(pageTextVerify))

    //Take a screenshot
    await browser.takeScreenshot()
  })

  



  
}
