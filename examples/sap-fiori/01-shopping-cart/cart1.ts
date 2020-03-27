import { step, TestSettings, Until, By, MouseButtons, Device, Driver, ENV, Key } from '@flood/element'
import * as assert from 'assert'

export const settings: TestSettings = {
  loopCount: -1,
  screenshotOnFailure: true,
  description: 'Quickstart Demo App - SAP',
  actionDelay: 3.5,
  stepDelay: 3.5,
  clearCache: true,	
  disableCache: true,
  clearCookies: true,
  chromeVersion: 'stable',
  waitTimeout: 60,
}

/**
 * SAP - Shopping Cart Demo App
 * https://sapui5.hana.ondemand.com/test-resources/sap/m/demokit/cart/webapp/index.html#/categories
 * Authored by Jason Rizio (jason@flood.io)
 * Version: 1.0
 */
export default () => {

  step('Shopping Cart Demo App: Home', async browser => {
    //Navigate to the Shopping Cart Demo Application
    await browser.visit('https://sapui5.hana.ondemand.com/test-resources/sap/m/demokit/cart/webapp/index.html#/categories')

    //Verify that we are on the correct page by checking that 'Employee List' text is shown on the page
    const pageTextVerify = By.visibleText('Product Catalog')
    await browser.wait(Until.elementIsVisible(pageTextVerify))

    //Take a screenshot
    await browser.takeScreenshot()
  })

  step('Shopping Cart Demo App: Flat Screen TVs', async browser => {
    
    //Click on the text link item called 'Flat Screen TVs'
    let obj_itm_FSTVs = By.xpath("//div[contains(text(),'Flat Screen TVs')]")
    await browser.wait(Until.elementIsVisible(obj_itm_FSTVs))
    let element1 = await browser.findElement(obj_itm_FSTVs)
    await element1.click() 

    //Verify that we are on the correct page by checking that 'Flat Screen TVs' text is shown on the page
    const pageTextVerify = By.visibleText("Flat Screen TVs")
    await browser.wait(Until.elementIsVisible(pageTextVerify))  

    //Take a screenshot
    await browser.takeScreenshot()
  })

  step('Shopping Cart Demo App: Select TV Model', async browser => {
    
    //Click on the text link item called 'Flat Watch HD37'
    let obj_btn_HD37 = By.xpath("//span[contains(text(),'Flat Watch HD37')]")
    await browser.wait(Until.elementIsVisible(obj_btn_HD37))
    let element1 = await browser.findElement(obj_btn_HD37)
    await element1.click() 

    //Verify that we are on the correct page by checking that '37-inch, 1366x768 Pixel' text is shown on the page
    const pageTextVerify = By.visibleText("37-inch, 1366x768 Pixel")
    await browser.wait(Until.elementIsVisible(pageTextVerify))

    //Click on the back navigation button
    let obj_btn_Back = By.css('#container-cart---category--page-navButton-iconBtn')
    await browser.wait(Until.elementIsVisible(obj_btn_Back))
    let element2 = await browser.findElement(obj_btn_Back)
    await element2.click()  

    //Take a screenshot
    await browser.takeScreenshot()
  })

  step('Shopping Cart Demo App: Add Item to Cart', async browser => {
    
    //Click on the Add to Cart
    let obj_btn_Item = By.css('#__button4-container-cart---welcomeView--promotedRow-0-img')
    await browser.wait(Until.elementIsVisible(obj_btn_Item))
    let element1 = await browser.findElement(obj_btn_Item)
    await element1.click() 

    //View your cart by clicking on the 'Shopping Trolley' icon in the top right hand corner
    let obj_btn_ViewCart = By.css('#__button3-img')
    await browser.wait(Until.elementIsVisible(obj_btn_ViewCart))
    let element2 = await browser.findElement(obj_btn_ViewCart)
    await element2.click()  

    //Verify that we have added the item successfully by checking that 'Save for Later' text is shown on the page
    const pageTextVerify2 = By.visibleText("Save for Later")
    await browser.wait(Until.elementIsVisible(pageTextVerify2))

    //Take a screenshot
    await browser.takeScreenshot()
  })

  step('Shopping Cart Demo App: Proceed', async browser => {
    
    //Click on the Proceed button
    let obj_btn_Proceed = By.xpath("//bdi[contains(@id, 'proceedButton')]")
    await browser.wait(Until.elementIsVisible(obj_btn_Proceed))
    let element1 = await browser.findElement(obj_btn_Proceed)
    await element1.click() 

    //Verify that we are on the correct page by checking that 'Items' text is shown on the page
    const pageTextVerify = By.visibleText("Items")
    await browser.wait(Until.elementIsVisible(pageTextVerify))

    //Take a screenshot
    await browser.takeScreenshot()
  })

  step('Shopping Cart Demo App: Step 2', async browser => {
    
    //Click on the Step 2 button to progress to the next step
    let obj_btn_Step2 = By.xpath("//bdi[contains(text(),'Step 2')]")
    await browser.wait(Until.elementIsVisible(obj_btn_Step2))
    let element1 = await browser.findElement(obj_btn_Step2)
    await element1.click() 

    //Verify that we are on the correct page by checking that 'Payment Type' text is shown on the page
    const pageTextVerify = By.visibleText("Payment Type")
    await browser.wait(Until.elementIsVisible(pageTextVerify))

    //Take a screenshot
    await browser.takeScreenshot()
  })  

  step('Shopping Cart Demo App: Cash on Delivery', async browser => {
    
    //Choose the 'Cash on Delivery' option
    let obj_btn_CoD = By.xpath("//li[contains(text(),'Cash on Delivery')]")
    await browser.wait(Until.elementIsVisible(obj_btn_CoD))
    let element1 = await browser.findElement(obj_btn_CoD)
    await element1.click() 

    //Take a screenshot
    await browser.takeScreenshot()
  })  
  
  step('Shopping Cart Demo App: Step 3', async browser => {

    //Click on the Step 3 button to progress to the next step
    let obj_btn_Step3 = By.xpath("//bdi[contains(text(),'Step 3')]")
    await browser.wait(Until.elementIsVisible(obj_btn_Step3))
    let element1 = await browser.findElement(obj_btn_Step3)
    await element1.click() 

    //Verify that we are on the correct page by checking that 'Details for Cash on Delivery' text is shown on the page
    const pageTextVerify = By.visibleText("Details for Cash on Delivery")
    await browser.wait(Until.elementIsVisible(pageTextVerify))

    //Take a screenshot
    await browser.takeScreenshot()
  }) 

  step('Shopping Cart Demo App: Enter Form Details', async browser => {

    //we need to use the Browser.page object so we can type in Form details to simulate the keyboard
    const page = browser.page

    let obj_txt_FirstName = By.xpath("//input[contains(@id, 'cashOnDeliveryName')]")
    await browser.wait(Until.elementIsVisible(obj_txt_FirstName))

    //Type in form details with a keyboard typing delay of 100 to simulate a real user
    await page.type('#container-cart---checkoutView--cashOnDeliveryName-inner', 'Tommy', {delay: 100});
    await page.type('#container-cart---checkoutView--cashOnDeliveryLastName-inner', 'Boy', {delay: 100});
    await page.type('#container-cart---checkoutView--cashOnDeliveryPhoneNumber-inner', '+61412345678', {delay: 100});
    await page.type('#container-cart---checkoutView--cashOnDeliveryEmail-inner', 'tommy.boy@mail.com', {delay: 100});

    //Press the 'Enter' key after the email to fire events to show the next Step button
    await page.type('#container-cart---checkoutView--cashOnDeliveryEmail-inner', String.fromCharCode(13));
    
    //Take a screenshot
    await browser.takeScreenshot()
  }) 
  
  step('Shopping Cart Demo App: Step 4', async browser => {

    //Click on the Step 4 button to progress to the next step
    let obj_btn_Step4 = By.xpath("//bdi[contains(text(),'Step 4')]")
    await browser.wait(Until.elementIsVisible(obj_btn_Step4))
    let element1 = await browser.findElement(obj_btn_Step4)
    await element1.click() 

    //Verify that we are on the correct page by checking that 'Invoice Address' text is shown on the page
    const pageTextVerify = By.visibleText("Invoice Address")
    await browser.wait(Until.elementIsVisible(pageTextVerify))

    //Take a screenshot      
    await browser.takeScreenshot()
  }) 
  
  step('Shopping Cart Demo App: Enter Address Details', async browser => {

    const page = browser.page

    //Ensure we are waiting for the Address field to appear before continuing
    let obj_txt_StreetAddress = By.xpath("//input[contains(@id, 'invoiceAddressAddress')]")
    await browser.wait(Until.elementIsVisible(obj_txt_StreetAddress))
    
    //Type in form details with a keyboard typing delay of 100 to simulate a real user
    await page.type('#container-cart---checkoutView--invoiceAddressAddress-inner', 'Main 123', {delay: 100});
    await page.type('#container-cart---checkoutView--invoiceAddressCity-inner', 'Mainville', {delay: 100});
    await page.type('#container-cart---checkoutView--invoiceAddressZip-inner', '22030', {delay: 100});
    await page.type('#container-cart---checkoutView--invoiceAddressCountry-inner', 'Australia', {delay: 100});

    //Press the 'Enter' key after the email to fire events to show the next Step button
    await page.type('#container-cart---checkoutView--invoiceAddressCountry-inner', String.fromCharCode(13));
    
    //Take a screenshot 
    await browser.takeScreenshot()
  }) 
  
  step('Shopping Cart Demo App: Step 5', async browser => {

    //Step 5 button should appear and we will continue by clicking on the button
    let obj_btn_Step5 = By.xpath("//bdi[contains(text(),'Step 5')]")
    await browser.wait(Until.elementIsVisible(obj_btn_Step5))
    let element1 = await browser.findElement(obj_btn_Step5)
    await element1.click() 

    //Verify that we are on the correct page by checking that 'Details Type' text is shown on the page
    const pageTextVerify = By.visibleText("Delivery Type")
    await browser.wait(Until.elementIsVisible(pageTextVerify))

    //Take a screenshot 
    await browser.takeScreenshot()
  }) 
  
  step('Shopping Cart Demo App: Order Summary', async browser => {

    //Click on the text link item called 'Order Summary'
    let obj_btn_Step5 = By.xpath("//bdi[contains(text(),'Order Summary')]")
    await browser.wait(Until.elementIsVisible(obj_btn_Step5))
    let element1 = await browser.findElement(obj_btn_Step5)
    await element1.click() 

    //Verify that we are on the correct page by checking that 'Selected Payment Type' text is shown on the page
    const pageTextVerify = By.visibleText("Selected Payment Type")
    await browser.wait(Until.elementIsVisible(pageTextVerify))

    //Take a screenshot 
    await browser.takeScreenshot()
  }) 



  
}
