---
id: magento
title: Magento Shop
---

This tutorial will encompass everything that a non-load testing expert will need to get started to write a script to test your Magento shop.

## Step 1: User loads the landing page

This one is easy. All we need to do is rename the step, replace the url of the page we’re loading, and remove all the comments.

```typescript
step("Test: User lands on the homepage", async (browser) => {
  await browser.visit("magento.loadtest.io");
  await browser.takeScreenshot();
});
```

> Download the entire script
>
> You can find the complete script used in this scenario, as well as other useful examples, in our [load-testing-playground](https://github.com/flood-io/load-testing-playground/tree/master/element) repository.

## Step 2: User searches for an item in the shop

For this step we’re going to use the search box in the top right of the homepage to search for shirts. We use the browser object’s `type` and `press` methods to simulate typing in _shirts_ and pressing return. After pressing return we are going to wait for the url to change to signify the page has changed.

```typescript
step("Test: User searches for an item from the homepage", async (browser) => {
  // Find the search box element
  const searchBox = By.css("#search");
  await browser.wait(Until.elementIsVisible(searchBox));
  // Search for our item
  await browser.type(searchBox, "shirt");
  await browser.press(Key.RETURN);
  await browser.wait(Until.urlContains("catalogsearch/result"));
});
```

If you save this step now, your browser should automatically re-run the test, visiting the homepage, typing into the search box, and visiting the results page.

This is a good time to talk about assertions in browser-level load testing. There can be so many moving parts in a web page. Sometimes pages will appear to load, but are obviously broken. For example, if our search results loaded, but had no results when we expected to find 5 shirts it would mean something is broken. We can use asserts to verify the page state. Add the following code to your step:

```typescript
// Make sure we have results
const countSelector = By.css(".toolbar-amount");
await browser.wait(Until.elementIsVisible(countSelector));
const countElement = await browser.findElement(countSelector);
const countText = await countElement.text();
assert(countText === "5 items", "Expected items are found");
```

Now our test will fail if we don’t have the expected amount of items. You can make your assertions as simple or as complex as you want. What matters is the first value is a boolean `true` for pass or `false` for fail.

Finally, we’re going to click the first result to take us to the new page.

```typescript
await browser.click(By.css(".product-image-photo:first-of-type"));
```

## Step 3: User adds the item to the shopping cart

We’re on the page to purchase our shirt and we want to add it to the cart. To make things complicated, we have to choose a colour and a size before we can add it to the cart. In our shop these don’t load immediately so it’s a little more complicated than waiting for the page to load and click them.

1. First, we make our locators for all the elements and wait until they’re visible.
2. Second, we click the options for black and large.
3. Finally, we click the button to add it to the cart.

```typescript
step("Test: Add the item to the shopping cart", async (browser) => {
  const black = By.css(".swatch-option.color:first-of-type");
  const large = By.css(".swatch-option.text:nth-of-type(4)");
  const addToCart = By.css("button.tocart");
  await browser.wait(Until.elementIsVisible(black));
  await browser.wait(Until.elementIsVisible(large));
  await browser.wait(Until.elementIsVisible(addToCart));
  await browser.click(black);
  await browser.click(large);
  await browser.click(addToCart);
});
```

For this step to be complete we should wait until we receive confirmation that the item was successfully added to the cart:

```typescript
const confirmationText = By.partialVisibleText("You added");
await browser.wait(Until.elementIsVisible(confirmationText));
await browser.takeScreenshot();
```

## Step 4: User visits the cart

This is another slightly complex navigation. In our shop the cart link shows a popover of the cart state instead of taking you directly to the cart. In the end it means we have to click it to show the popover, _and then_ click the view cart link inside the popover.

```typescript
step("Test: User visits the shopping cart", async (browser) => {
  const showCart = By.css(".showcart");
  await browser.click(showCart);
  const viewCart = By.css(".viewcart");
  await browser.wait(Until.elementIsVisible(viewCart));
  await browser.click(viewCart);
  await browser.wait(Until.urlContains("checkout/cart"));
});
```

Once there, like the search page we should assert the page has the correct information. This time we’re going to check the total price is correct.

```typescript
const total = By.css(".grand.totals .price");
await browser.wait(Until.elementIsVisible(total));
const totalElement = await browser.findElement(total);
const price = await totalElement.text();
await browser.takeScreenshot();
assert(price === "$45.00", "Has the correct total in the cart");
```

## Step 5: User goes to checkout

The checkout process is always a long step because there is so much user interaction necessary. Fields have to be filled, shipping options chosen. On our `magento.loadtest.io` demo site, you don’t have to enter payment info.

First, let’s go to the checkout page and fill out the form.

```typescript
step("Test: User goes through the checkout process", async (browser) => {
  await browser.click(By.visibleText("Proceed to Checkout"));
  await browser.wait(Until.urlContains("checkout"));
  // Wait for the form to load
  await browser.wait(
    Until.elementIsVisible(By.visibleText("Shipping Address"))
  );
  // Prepare our inputs
  const values = [
    ["#customer-email", "you@example.com"],
    ["input[name=firstname]", "Joe"],
    ["input[name=lastname]", "LoadTester"],
    ['input[name="street[0]"]', "123 Fake St."],
    ['input[name="city"]', "Fakeville"],
    ['input[name="postcode"]', "90210"],
    ['input[name="telephone"]', "+1582582582"],
  ];
  // Fill in all our details
  for (let i = 0; i < values.length; i++) {
    const element = By.css(values[i][0]);
    const value = values[i][1];
    await browser.type(element, value);
  }
  // Choose the region
  await browser.selectByText(By.css("select[name=region_id]"), "California");
  // Choose the shipping option
  await browser.click(
    By.css(
      ".table-checkout-shipping-method tbody .row:first-of-type .col-carrier"
    )
  );
  await browser.takeScreenshot();
});
```

Then, once shipping has been selected we can move onto payment. Our demo doesn’t have real payment, so this is the best we can do with the demo site.

```typescript
// Move onto payment
await browser.click(By.visibleText("Next"));
// Place the order!
const placeOrder = By.visibleText("Place Order");
await browser.wait(Until.elementIsVisible(placeOrder));
await browser.takeScreenshot();
await browser.click(placeOrder);
await browser.takeScreenshot();
```

## Download the entire script

Your site will have different payment requirements, but you can use the skills you learnt in this tutorial to write that part of the script. If you’d like to download our sample script, and many other examples, take a look at our [load-testing-playground][loadtestingplayground] repository.

[loadtestingplayground]: [https://github.com/flood-io/load-testing-playground/tree/master/element/]
