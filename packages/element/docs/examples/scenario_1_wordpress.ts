import { step, TestSettings, Until, By } from '@flood/element'
import * as assert from 'assert'

export const settings: TestSettings = {
	loopCount: -1,
	screenshotOnFailure: true,
	description: 'The Flood Store - Detailed Tutorial',
	actionDelay: 10,
	stepDelay: 7,
	disableCache: true,
	clearCookies: true,
}

/**
 * The Flood Store
 * Version: 1.0
 */
export default () => {
	step('The Flood Store: Home', async browser => {
		await browser.visit('https://jriz.io')

		let pageTextVerify = By.visibleText('Welcome to the Flood IO Merchandise Store.')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

		await browser.takeScreenshot()
	})

	step('The Flood Store: Click Hoodies', async browser => {
		let lnkHoodies = await browser.findElement(By.partialLinkText('Hoodies'))
		await lnkHoodies.click()

		let pageTextVerify = By.visibleText('Hoodie with Logo')
		await browser.wait(Until.elementIsVisible(pageTextVerify))
	})

	step('The Flood Store: Add To Cart', async browser => {
		let addHoodieToCart = await browser.findElement(By.xpath('//a[@data-product_id=39]'))
		await addHoodieToCart.click()
	})

	step('The Flood Store: View Cart', async browser => {
		await browser.visit('https://jriz.io/cart')

		let pageTextVerify1 = By.visibleText('Free shipping')
		await browser.wait(Until.elementIsVisible(pageTextVerify1))

		let pageTextVerify2 = By.visibleText('Hoodie with Logo')
		await browser.wait(Until.elementIsVisible(pageTextVerify2))

		//await browser.takeScreenshot()
	})

	step('The Flood Store: Proceed to Checkout', async browser => {
		let lnkProceedToCheckout = By.css('#post-14 > div > div > div > div > div > a')
		await browser.wait(Until.elementIsVisible(lnkProceedToCheckout))
		let element = await browser.findElement(lnkProceedToCheckout)
		await element.focus()
		await element.click()

		let pageTextVerify = By.visibleText('Returning customer?')
		await browser.wait(Until.elementIsVisible(pageTextVerify))
	})

	step('The Flood Store: Checkout Data Entry', async browser => {
		//let billingFirstName = await browser.findElement(By.id('billing_first_name'))

		// Fill in text field - billing First Name
		await browser.type(By.id('billing_first_name'), 'Jason')

		// Fill in text field - billing First Name
		await browser.type(By.id('billing_last_name'), 'Rizioz')

		// Select from searchable dropdown - billing Country
		let element = await browser.findElement(By.id('billing_country'))
		await element.focus()
		await element.click()
		await browser.type(By.xpath('/html/body/span/span/span[1]/input'), 'Australia')
		await browser.type(By.xpath('/html/body/span/span/span[1]/input'), String.fromCharCode(13)) //Simulate Enter key

		// Fill in text field - billing Address 1
		await browser.type(By.id('billing_address_1'), '123 ABC Street')

		// Fill in text field - billing City
		await browser.type(By.id('billing_city'), 'Melbourne')

		// Select from searchable dropdown - billing State
		let element_state = await browser.findElement(By.id('billing_state'))
		await element_state.focus()
		await element_state.click()
		await browser.type(By.xpath('/html/body/span/span/span[1]/input'), 'Victoria')
		await browser.type(By.xpath('/html/body/span/span/span[1]/input'), String.fromCharCode(13)) //Simulate Enter key

		// Fill in text field - billing postcode
		await browser.type(By.id('billing_postcode'), '3000')

		// Fill in text field - billing phone
		await browser.type(By.id('billing_phone'), '0400000123')

		// Fill in text field - billing email
		await browser.type(By.id('billing_email'), 'jason@flood.io')

		await browser.takeScreenshot()
	})

	step('The Flood Store: Place Order', async browser => {
		let btnPlaceOrder = By.xpath('//button[contains(@name, "woocommerce_checkout_place_order")]')
		await browser.wait(Until.elementIsVisible(btnPlaceOrder))
		let element = await browser.findElement(btnPlaceOrder)
		await element.focus()
		await element.click()

		//let pageTextVerify = By.visibleText('Thank you. Your order has been received.')
		let pageTextVerify = By.visibleText('Order received')
		await browser.wait(Until.elementIsVisible(pageTextVerify))

		await browser.takeScreenshot()
	})
}
