import { step, TestSettings, Until, By, MouseButtons, Device, Driver, ENV, Key } from '@flood/element'
import * as assert from 'assert'

export const settings: TestSettings = {
  loopCount: -1,
  screenshotOnFailure: true,
  description: 'Sales Orders Demo App - SAP',
  actionDelay: 3.5,
  stepDelay: 3.5,
  clearCache: true,	
  disableCache: true,
  clearCookies: true,
  chromeVersion: 'stable',
  waitTimeout: 60,
}

/**
 * SAP - Sales Orders Demo App
 * https://sapui5.hana.ondemand.com/test-resources/sap/suite/ui/generic/template/demokit/sample.manage.products.sepmra/test/index.html#masterDetail-display
 * Authored by Jason Rizio (jason@flood.io)
 * Version: 1.0
 */
export default () => {

  step('Sales Orders Demo App: Home', async browser => {
    await browser.visit('https://sapui5.hana.ondemand.com/test-resources/sap/suite/ui/generic/template/demokit/sample.manage.products.sepmra/test/index.html#masterDetail-display')

    const pageTextVerify = By.visibleText('Products (0)')
    await browser.wait(Until.elementIsVisible(pageTextVerify))

    await browser.takeScreenshot()
  })

  step('Sales Orders Demo App: Select Supplier', async browser => {
    
    let obj_itm_Supplier = By.xpath("//span[contains(@id, 'Supplier-multiinput-vhi')]")
    await browser.wait(Until.elementIsVisible(obj_itm_Supplier))
    let element1 = await browser.findElement(obj_itm_Supplier)
    await element1.click() 

    const pageTextVerify = By.visibleText("Select Supplier")
    await browser.wait(Until.elementIsVisible(pageTextVerify))  

    await browser.takeScreenshot()
  })

  step('Sales Orders Demo App: Choose Supplier', async browser => {
    
    let obj_itm_item0 = By.xpath("//div[contains(@id, '__item7-__clone0')]")
    await browser.wait(Until.elementIsVisible(obj_itm_item0))
    let element1 = await browser.findElement(obj_itm_item0)
    await element1.click() 

    const pageTextVerify = By.visibleText("Selected: 1")
    await browser.wait(Until.elementIsVisible(pageTextVerify))  

    await browser.takeScreenshot()
  })

  step('Sales Orders Demo App: Confirm Supplier', async browser => {
    
    let obj_btn_OK = By.xpath("//bdi[contains(text(),'OK')]")
    await browser.wait(Until.elementIsVisible(obj_btn_OK))
    let element1 = await browser.findElement(obj_btn_OK)
    await element1.click() 

    const pageTextVerify = By.visibleText("Selected: 1")
    await browser.wait(Until.elementIsVisible(pageTextVerify))  

    await browser.takeScreenshot()
  })

  step('Sales Orders Demo App: Search', async browser => {
    
    const page = browser.page

    let obj_txt_SearchText = By.xpath("//input[contains(@placeholder, 'Search')]")
    await browser.wait(Until.elementIsVisible(obj_txt_SearchText))
    await browser.type(By.xpath("//input[contains(@placeholder, 'Search')]"), String.fromCharCode(13))
    
    const pageTextVerify = By.visibleText("Family PC Pro")
    await browser.wait(Until.elementIsVisible(pageTextVerify))  

    await browser.takeScreenshot()
  })

  step('Sales Orders Demo App: Choose Product', async browser => {
    
    //Family PC Pro
    let obj_itm_FamilyPCPro = By.xpath("//a[contains(text(),'Family PC Pro')]")
    await browser.wait(Until.elementIsVisible(obj_itm_FamilyPCPro))
    let element1 = await browser.findElement(obj_itm_FamilyPCPro)
    await element1.click()     
    
    const pageTextVerify = By.visibleText("Supplier Name")
    await browser.wait(Until.elementIsVisible(pageTextVerify))  

    await browser.takeScreenshot()
  })

  


  
}
