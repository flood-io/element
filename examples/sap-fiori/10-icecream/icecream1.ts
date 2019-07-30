import { step, TestSettings, Until, By, MouseButtons, Device, Driver, ENV, Key } from '@flood/element'
import * as assert from 'assert'

export const settings: TestSettings = {
  loopCount: -1,
  screenshotOnFailure: true,
  description: 'Icecream Demo App - SAP',
  actionDelay: 3.5,
  stepDelay: 3.5,
  clearCache: true,	
  disableCache: true,
  clearCookies: true,
  chromeVersion: 'stable',
  waitTimeout: 60,
}

/**
 * SAP - Icecream Demo App
 * https://sapui5.hana.ondemand.com/test-resources/sap/suite/ui/commons/demokit/icecream/webapp/index.html
 * Authored by Jason Rizio (jason@flood.io)
 * Version: 1.0
 */
export default () => {

  step('Icecream Demo App: Home', async browser => {
    await browser.visit('https://sapui5.hana.ondemand.com/test-resources/sap/suite/ui/commons/demokit/icecream/webapp/index.html')

    const pageTextVerify = By.visibleText('Ice Cream Machine')
    await browser.wait(Until.elementIsVisible(pageTextVerify))

    await browser.takeScreenshot()
  })

  step('Icecream Demo App: Click Tile', async browser => {
    
    let obj_btn_ProductionProcess = By.xpath("//div[contains(@aria-label, 'Production Process')]")
    await browser.wait(Until.elementIsVisible(obj_btn_ProductionProcess))
    let element1 = await browser.findElement(obj_btn_ProductionProcess)
    await element1.click() 

    const pageTextVerify = By.visibleText("Key Figures for 2017")
    await browser.wait(Until.elementIsVisible(pageTextVerify))  

    await browser.takeScreenshot()
  })

  step('Icecream Demo App: Click Raw Material node with Mouse Coords', async browser => {

    const pageTextVerify = By.visibleText("Key Figures for 2017")
    await browser.wait(Until.elementIsVisible(pageTextVerify)) 

    await browser.mouse.click(188, 552)

    await browser.takeScreenshot()
  })
  
  
  



  
}
