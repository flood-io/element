import { step, TestSettings, Until, By, Key } from '@flood/element'
import * as assert from 'assert'

export const settings: TestSettings = {
	clearCache: true,
	disableCache: true,
	stepDelay: 8.5,
	actionDelay: 8.5,
	screenshotOnFailure: true
}

/**
 * SAP S/4 HANA Element Script - Create Sales Order
 * @version 1.0
 */
export default () => {
    
    step('Visit S/4 Hana Trial Login', async browser => {
		await browser.visit('https://my300197.s4hana.ondemand.com/ui#Shell-home')
	})

	step('S/4 Hana Login', async browser => {

    	//Validate text
    	let loginValidation = By.visibleText('Log On')
        await browser.wait(Until.elementIsVisible(loginValidation))

        //enter username
        await browser.type(By.css('#j_username'), "j.rizio@tricentis.com")

        //enter password
        await browser.type(By.css('#j_password'), "YvnXh39rpjEF")

        let signin = await browser.findElement(By.css('#logOnFormSubmit'))
        await signin.click()        

    	//Validate text
    	let dashValidation = By.visibleText('Trial Center')
        await browser.wait(Until.elementIsVisible(dashValidation))          
        
        await browser.takeScreenshot()

    })
    
	step('Create Sales Order', async browser => {

    	//Validate text
    	let dashValidation = By.visibleText('Trial Center')
        await browser.wait(Until.elementIsVisible(dashValidation))    
        
        //click Create Sales Orders
        let btnCreateSalesOrders = await browser.findElement(By.xpath("//div[contains(@aria-label, 'Create Sales Orders')]"))
        await btnCreateSalesOrders.click()    

    	//Validate text
    	let salesordersValidation = By.visibleText('New Sales Order')
        await browser.wait(Until.elementIsVisible(salesordersValidation))              
        
        await browser.takeScreenshot()

    }) 

    step('Sales Order Entry - Enter Details', async browser => {

        //Sold-To Party (will pre-fill other fields after TAB press)
        await browser.type(By.xpath("//input[contains(@id, 'Identification::SoldToParty')]"), "17100001")
        await browser.press(Key.TAB)

        //Sales Organization
        //await browser.type(By.xpath("//input[contains(@id, 'Identification::SalesOrganization')]"), "1710")

        //Distribution Channel
        //await browser.type(By.xpath("//input[contains(@id, 'Identification::DistributionChannel')]"), "10")

        //Division
        //await browser.type(By.xpath("//input[contains(@id, 'Identification::OrganizationDivision')]"), "00")        
        
        await browser.takeScreenshot()

    }) 

    step('Sales Order Entry - Add Item', async browser => {

        //Material
        await browser.type(By.xpath("//input[contains(@id, 'Default::Material')]"), "TG11")
        await browser.press(Key.TAB)

        //Requested Quantity
        await browser.type(By.xpath("//input[contains(@id, 'Default::RequestedQuantity')]"), "1")
        await browser.press(Key.TAB)

        //Requested Delivery Date
        //await browser.type(By.xpath("//input[contains(@id, 'Default::RequestedDeliveryDate')]"), "01/16/2019")
        //await browser.press(Key.TAB)

        //click Add Item
        let btnAddItem = await browser.findElement(By.xpath("//span[contains(@id, 'BtnAddToItems')]"))
        await btnAddItem.click()    
        
        await browser.takeScreenshot()

    })     

    step('Sales Order Entry - Save', async browser => {

        //click Save
        let btnSave = await browser.findElement(By.xpath("//button[contains(@id, 'Details::C_SalesOrderTP--activate')]"))
        await btnSave.click()     

        //Item is not relevant for output.
    	let warningValidation = By.visibleText('Item is not relevant for output.')
        await browser.wait(Until.elementIsVisible(warningValidation))   
        
        //Close warning dialog
        let btnClose = await browser.findElement(By.xpath("//button[contains(@id, 'manageSalesOrder-component-appContent--Close')]"))
        await btnClose.click()
        
        //retrieve Sales Order number
    	let salesOrderNumber = await browser.findElements(By.xpath('//*[@id="cus.sd.salesorder20.manage::sap.suite.ui.generic.template.ObjectPage.view.Details::C_SalesOrderTP--objectPageHeader-innerTitle"]'))
    	let salesOrderNumberValue = await Promise.all(salesOrderNumber.map(span => span.text()))
        console.log('salesOrderNumberValue = ' + salesOrderNumberValue[0])  
        
        //click home #homeBtn
        let btnHome = await browser.findElement(By.css('#homeBtn'))
        await btnHome.click()
       
        await browser.takeScreenshot()

    })   

    step('Sales Order Entry - Back to Dashboard', async browser => {
        
        //Close warning dialog
        let btnClose = await browser.findElement(By.xpath("//button[contains(@id, 'manageSalesOrder-component-appContent--Close')]"))
        await btnClose.click()
        
        //retrieve Sales Order number
    	let salesOrderNumber = await browser.findElements(By.xpath('//*[@id="cus.sd.salesorder20.manage::sap.suite.ui.generic.template.ObjectPage.view.Details::C_SalesOrderTP--objectPageHeader-innerTitle"]'))
    	let salesOrderNumberValue = await Promise.all(salesOrderNumber.map(span => span.text()))
        console.log('salesOrderNumberValue = ' + salesOrderNumberValue[0])  
        
        //click home #homeBtn
        let btnHome = await browser.findElement(By.css('#homeBtn'))
        await btnHome.click()
       
        await browser.takeScreenshot()

    })       
}


