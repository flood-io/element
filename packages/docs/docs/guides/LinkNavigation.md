---
id: link-navigation
title: Link Navigation
---

## Overview

Web-based link navigation is easily achieved with Flood Element. You are have a number of different tools at your disposal to query and take action on links within in application: detecting visible text, using CSS selectors or XPath.

## Using Visible Link Text

The simplest way to click on a web link is to use its visible text link description as follows:

```typescript
const linkHoodies = await browser.findElement(By.partialLinkText('Hoodies'))
await linkHoodies.click()
```

Note that each call to the browser (`findElement`) or the element that it returns (`click`) is asynchronous so we need to `await` each one.

## Using CSS Selectors

You can also use a link or button's CSS properties to locate and click as follows:

```typescript
const linkProceedToCheckout = await browser.findElement(By.css('#post-14 > div > div > a'))
await linkProceedToCheckout.click()
```

## Using XPath

Sometimes visible text or CSS selectors aren't specific enough to find the element you need. In these cases, consider using 
XPath to help locate a link or button object as in this example:

```typescript
const addHoodieToCart = await browser.findElement(By.xpath('//a[@data-product_id=39]'))
await addHoodieToCart.click()
```

This is uses the <a ... > tag property 'data-product_id' to locate the specific link button we would like to click on.

## Finding selectors

The Chrome Devtools Inspector has some handy tools for finding CSS or XPath selectors.

1. In your normal desktop Chrome browser, right click on the element you're interested in.
1. Select `Inspect`. The Chrome Devtools Inspector should appear.
1. The element you right clicked on will be selected, but you might need to search higher or lower in the DOM tree to find the specific link or button you need. Use the `Elements` tab to locate the precise element. Hover your cursor over the tag in the DOM tree and it will be highlighted on the page.
1. Once you've found it, right click on the element and select `Copy > Copy selector` for CSS, or `Copy > Copy XPath` for XPath.
1. Now paste that selector into your test script as detailed in the examples above.

## Extended example

In some circumstances, simply selecting and clicking a link may not be the optimal approach.
For example, if you're attempting to stabilise the performance characteristics of the load test that your script will be part of, you may opt to include extra steps to wait for page elements to appear before proceeding.

Here we wait for an element to be visible before proceeding as well as ensure we have application focus on the element before we click on it:

```typescript
// first we create a locator using CSS selector
// we can reuse this locator throughout
let linkProceedToCheckout = By.css('#post-14 > div > div > a')
// wait for the element to become visible
await browser.wait(Until.elementIsVisible(linkProceedToCheckout))

// obtain a direct handle to the element
let element = await browser.findElement(linkProceedToCheckout)
// focus the link
await element.focus()
// finally click the link
await element.click()
```

<!-- suffix -->
