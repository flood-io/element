---
title: Deep Dive Tutorial
---

# Detailed Tutorial - The Flood Merchandise Store

## Overview

This detailed example will show you how to actually build a working Flood Element script that uses a variety of different classes to identify objects you would like to interact with in order to successfully simulate a typical business process.

The example uses a site called 'The Flood Store' - a fictional online shopping store that sells Tricentis Flood branded apparel and other clothing items. It is fairly representative of a typical online store that customers may require to be load tested but is complex enough that using a traditional load test tool such as Jmeter or Gatling requires a lot of work in scripting against.

It is built using Wordpress and the WooCommerce plug-in.

We'll show you how you can achieve creating a full user item purchase scenario quickly and easily using Flood Element.

## Tools Used

1. **A Tricentis Flood Account** - You will need a Flood account in order to run Flood Element scripts with more than 1 concurrent user.
2. **Flood Element CLI \(optional\)** - The CLI tool is a great way to verify your script compiles correctly before running it on the Flood platform.
3. **Google Chrome \(optional\)** - Flood Element identifies page objects by individual properties or identifiers. The Google Chrome browser contains the ability to inspect object properties in realtime. These properties are used by the Flood Element script in order to interact with the given page object.

## Download the entire script

Please find the script used in this detailed scenario here: \(link\)\[./scenario\_1\_wordpress.ts\]

## Overview of script configuration settings

Some initial script parameters need to be stated at the very start of the script - let's delve into them line by line:

a. **import { ... }**

```typescript
import { step, TestSettings, Until, By } from '@flood/element'
import * as assert from 'assert'
}
```

The initial import statement allows you to add classes relating to test steps, test settings, and By functions etc. that are needed by the script to carry out actions against objects you have defined. For basic tests the above included classes shoudl suffice. You will need to review these if you require further functionality from other classes that are not listed above.

The importing of the assert class is useful if you would like to use assertions to capture and verify strings/integers or any data retrieved from objects during test execution. This can also be reported in the console.

b. **export consts settings { ... }**

```typescript
export const settings: TestSettings = {
    loopCount: 50,
    description: 'The Flood Store - Detailed Tutorial',
    screenshotOnFailure: true,
    disableCache: true,
    //clearCache: true,
    clearCookies: true,
    actionDelay: 1.5,
    stepDelay: 2.5,
}
```

This export block allows you to specify constants related to typical Test Settings used in all load tests:

* loopCount: Used to specify how many iterations \(or loops\) you would like each user to run. If commented out or not included - the test will run forever.
* description: A simple description sentence describing the aim of the test scenario.
* screenshotOnFailure: A screenshot of the current page will automatically be generated when Flood Element detects a failure has occurred. These are viewable in the captured results for each Flood.
* disableCache / clearCache: No caching is done if this is set to true.
* clearCookies: Any cookies detected will be cleared for each iteration if this is set to true.
* actionDelay: the amount of time in seconds that the Flood Element replay engine will wait in between actions contained within a step.
* stepDelay: the amount of time in seconds that the Flood Element replay engine will wait in between steps.

c. **export default\(\) =&gt; { ... }**

The export default\(\) function is the main area housing all the steps for your business process.

## Step 1 - Navigation and page verification

The first step we will use contains the step to tell Flood Element to visit the initial target URL and to do some page verification to ensure we have successfully landed on the correct page and the page contents is returned as expected.

![The Flood Store - Homepage](https://raw.githubusercontent.com/flood-io/flood-chrome-docs/master/examples/images/step-1-homepage.png)

```typescript
    step('The Flood Store: Home', async browser => {

        await browser.visit('https://wordpress.loadtest.io')

        let pageTextVerify = By.visibleText('Welcome to the Flood IO Merchandise Store.')
        await browser.wait(Until.elementIsVisible(pageTextVerify))

    })
```

Every step should be named appropriately to tell us what functionality is taking place \(and how long does it take\) within the step contents. So for this step we are timing how long the target URL takes to load from a user's perspective and also the verification that we are on the correct page.

The page text verification is purely just telling Flood Element to wait for a specific visible text element to appear before the step completes.

It serves two important purposes for load testing:

a. If the verification passes - we were able to load the page and verify it was the correct page with the correct time.

b. If the verification fails - the page may be showing an error to the user in circumstances where the server may be overloaded with too much traffic - a common occurrence when executing load tests.

## Step 2 - Navigation using HTML Text Links

The second step enables us to interact with a page object on the front page navigated to in Step 1. That will lead us to the next step in the business process.

For this step we want to navigate to a particular clothing type - called a 'Hoodie'. To get to this clothing section we need to click on a text based link as shown below:

![The Flood Store - Hoodies Text Link](https://raw.githubusercontent.com/flood-io/flood-chrome-docs/master/examples/images/step-2-hoodies.png)

This type of page interaction is very simple and powerful for normal text based links - we use the following step to achieve this as well as another page text verification to ensure we are on the expected page.

```typescript
step('The Flood Store: Click Hoodies', async browser => {
    let lnkHoodies = await browser.findElement(By.partialLinkText('Hoodies'))
    await lnkHoodies.click()

    let pageTextVerify = By.visibleText('Hoodie with Logo')
    await browser.wait(Until.elementIsVisible(pageTextVerify))
})
```

This step represents the actual click and subsequent page load of the user interaction of your end user clicking on the 'Hoodies' link and waiting for the next page to load.

Here we have the unique step name \(aka. the Transaction name\) - but also a new findElement function which is used by Flood Element to identify the object we need to interact with. Inside this function we can use a number of By.xxx sub functions that will allow us to be more specific in identifying the particular object we want.

For text links, we can use partialLinkText and also linkText. linkText needs to be the exact link string specified within the A HREF link tags. partialLinkText only needs a partial match of the link text to be able to identify the object.

Using the Developer Tools feature in Google Element, we are able to view the exact text of a hyperlink. Simply right-click or hold down the CTRL button while clicking on the link and then select Inspect. The Developer Tools sidebar will appear which will automatically highlight the link code for you, as follows:

![Hoodies - Link Text](https://raw.githubusercontent.com/flood-io/flood-chrome-docs/master/examples/images/step-3-hoodies-link-code.png)

As you can see the link is fairly ugly as it contains a carriage return and a number of spaces on either side of the 'Hoodies' text so definitely a good example of the need to use the partialLinkText function!

## Step 3 - Using XPath

XPath notation is a popular way of identifying objects that you would like to interact with. Flood Element fully supports XPath definitions which can be very helpful and an alternate way of object interaction.

```typescript
step('The Flood Store: Add To Cart', async (browser: Driver) => {
    let addHoodieToCart = await browser.findElement(
        By.xpath('//a[@data-product_id=39]'),
    )
    await addHoodieToCart.click()
})
```

Once we have clicked on the 'Hoodies' link, we are taken to the Hoodies sub-page, which shows the user every single 'Hoodie' clothing type available to be purchased. Each product on a shopping site usually has a uniquely identifying code tied to it that we can use to select that item for completing our business process.

For the sake of this simple script, we know the hoodie we want to add to the cart has a product ID of 39. We can see this again using the Developer Tools and highlighting the Add to Cart button of the item we'd like to add to our cart:

![Hoodies - Add To Cart button](https://raw.githubusercontent.com/flood-io/flood-chrome-docs/master/examples/images/step-3-hoodie-addtocart.png)

![Hoodies - Product ID code](https://raw.githubusercontent.com/flood-io/flood-chrome-docs/master/examples/images/step-3-hoodie-product-id.png)

So using the above step XPath example we can use the following XPath expression:

```typescript
'//a[@data-product_id=39]'
```

So we are able to narrow down from the entire page what exact object we wish to interact with. We start by looking at the entire document object model \(denoted by the //\), all links on the page \(denoted by the 'a' html tag\), any links that have the data-product\_id parameter, and lastly only the link that has the data-product\_id parameter equal to the value 39.

Flood Element now knows exactly what object it needs to select.

After Flood Element adds this item to the cart, we can navigate to the Cart page where we should see the item we just added.

```typescript
step('The Flood Store: View Cart', async (browser: Driver) => {
    await browser.visit('https://wordpress.loadtest.io/cart')

    let pageTextVerify1 = By.visibleText('Free shipping')
    await browser.wait(Until.elementIsVisible(pageTextVerify1))

    let pageTextVerify2 = By.visibleText('Hoodie with Logo')
    await browser.wait(Until.elementIsVisible(pageTextVerify2))

    await browser.takeScreenshot()
})
```

So we just use another 'browser.visit' step to go to the actual Cart page and verify firstly that the page is present and secondly that the item 'Hoodie with Logo' is listed as an item.

We also have the ability to take a screenshot of this page so we can verify later that we successfully went to the correct page and that the correct item was placed in the cart - exactly how the user will see it.

## Step 4 - Using CSS Selectors

Using CSS selectors is another way of identifying objects that we would like to interact with. In this step we would like to proceed to the checkout page with the item we selected in Step 3 in our shopping cart.

Again, we need to have a look at the properties of this button and we do this with the Developer Tools feature as well. The properties can be selected using the following steps:

a. Right click on the Proceed to Checkout button and click Inspect. This will bring up the actual line of code of the button object:

![Proceed to Checkout - code](https://raw.githubusercontent.com/flood-io/flood-chrome-docs/master/examples/images/step-4-proceed-checkout-code.png)

b. Click on the ellipsis link \(...\) and click Copy &gt; Copy selector.

![Proceed to Checkout - copy selector](https://raw.githubusercontent.com/flood-io/flood-chrome-docs/master/examples/images/step-4-copy-selector.png)

This will copy the exact CSS selector path that can be used in your step as follows:

```typescript
    step('The Flood Store: Proceed to Checkout', async browser => {

        let lnkProceedToCheckout = By.css('#post-14 > div > div > div > div > div > a')
        await browser.wait(Until.elementIsVisible(lnkProceedToCheckout))
        let element = await browser.findElement(lnkProceedToCheckout)
        await element.focus()
        await element.click()

        let pageTextVerify = By.visibleText('Returning customer?')
        await browser.wait(Until.elementIsVisible(pageTextVerify))

    })
```

In this case our Selector produced: '\#post-14 &gt; div &gt; div &gt; div &gt; div &gt; div &gt; a' which is what can be used in the By.css step above.

## Step 5 - Text entry & form field input

Filling out a form with a number of text entry fields can be very easily achieved with Flood Element. All we need to do is to find out the CSS or unique input ID of the field we would like to enter text into and include it in a step as follows:

```typescript
    step('The Flood Store: Checkout Data Entry', async browser => {

        //let billingFirstName = await browser.findElement(By.id('billing_first_name'))

           // Fill in text field - billing First Name
        await browser.type(By.id('billing_first_name'), 'Jason')

           // Fill in text field - billing First Name
        await browser.type(By.id('billing_last_name'), 'Rizio')

        //...    

    })
```

As you can see, a simple line of code per field containing the text string needing to be entered is all that is required to fill out a form.

## Step 6 - Placing the order

We have now almost completed the full item purchase business process. All that is left is to click the place order button using the following step:

```typescript
    step('The Flood Store: Place Order', async browser => {

        let btnPlaceOrder = By.id('place_order')
        await browser.wait(Until.elementIsVisible(btnPlaceOrder))
        let element = await browser.findElement(btnPlaceOrder)
        await element.focus()
        await element.click()    

        let pageTextVerify = By.visibleText('Thank you. Your order has been received.')
        await browser.wait(Until.elementIsVisible(pageTextVerify))

        await browser.takeScreenshot()

    })
```

When an object has a unique id, it makes our scripting very easy to describe the object. Here the button has an id called 'place\_order' which is all we need to use in order to interact with the object successfully.

This step is almost identicial to the one in Step 4 except the usage of the id in this case. We are still clicking on the button and then verifying the order has gone through by verifying the expected text 'Thank you. Your order has been received'.

## Conclusion

So we have completed scripting a full end-to-end purchase of an item in a typical online store using a number of different methods with Flood Element. This is quite a comprehensive and complex task using a protocol level user that is more common in popular load test tools such as Jmeter and Gatling.

Usage of a Browser Level User such as Flood Element takes a lot of the complexity out of scripting these types of dynamic sites.

