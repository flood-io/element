import { step, TestSettings, Until, By, MouseButtons, Device, Driver, ENV, Key } from '@flood/element'
import * as assert from 'assert'

export const settings: TestSettings = {
  loopCount: -1,
  screenshotOnFailure: true,
  description: 'Worklist FLP Demo App - SAP',
  actionDelay: 3.5,
  stepDelay: 3.5,
  clearCache: true,	
  disableCache: true,
  clearCookies: true,
  chromeVersion: 'stable',
  waitTimeout: 60,
}

/**
 * SAP - Worklist FLP Demo App
 * https://sapui5.hana.ondemand.com/test-resources/sap/ui/demoapps/demokit/worklist/webapp/test/flpSandboxMockServer.html#Worklist-display
 * Authored by Jason Rizio (jason@flood.io)
 * Version: 1.0
 */
export default () => {

  step('Worklist FLP Demo App: Home', async browser => {
    await browser.visit('https://sapui5.hana.ondemand.com/test-resources/sap/ui/demoapps/demokit/worklist/webapp/test/flpSandboxMockServer.html#Worklist-display')

    const pageTextVerify = By.visibleText('<Objects>')
    await browser.wait(Until.elementIsVisible(pageTextVerify))

    await browser.takeScreenshot()
  })

  step('Worklist FLP Demo App: Search Worklist', async browser => {

    const page = browser.page
    
    //Search worklist
    let obj_txt_SearchAnalysisType = By.xpath("//input[contains(@placeholder, 'Search')]")
    await browser.wait(Until.elementIsVisible(obj_txt_SearchAnalysisType))
    await browser.type(obj_txt_SearchAnalysisType, "Object 19")
    await page.keyboard.press('Enter')

    const pageTextVerify = By.visibleText('Object 19')
    await browser.wait(Until.elementIsVisible(pageTextVerify))

    await browser.takeScreenshot()
  })
  
  step('Worklist FLP Demo App: Select Worklist', async browser => {

    
    //Select worklist
    let obj_span_WorklistItem = By.xpath("//span[contains(text(),'Object 19')]")
    await browser.wait(Until.elementIsVisible(obj_span_WorklistItem))
    let element1 = await browser.findElement(obj_span_WorklistItem)
    await element1.click() 

    const pageTextVerify = By.visibleText('560.00')
    await browser.wait(Until.elementIsVisible(pageTextVerify))

    await browser.takeScreenshot()
  })

  



  
}
