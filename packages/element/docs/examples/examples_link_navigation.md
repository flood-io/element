---
title: Examples - Link Navigation
---

# Examples - Link Navigation

## Overview

Web-based link navigation can be done quite easily with Flood Element. You are able to use a number of different ways to take action on links within in application using visible text, CSS selectors and XPath.

## Using Visible Link Text

The simplest way to click on a web link is to use it's visible text link description as follows:

```typescript
		let lnkHoodies = await browser.findElement(By.partialLinkText("Hoodies"))
		await lnkHoodies.click()
```

## Using XPath

You are able to use XPath to help locate a link and/or button object by using the link/button properties as follows:

```typescript
		let addHoodieToCart = await browser.findElement(By.xpath("//a[@data-product_id=39]"))
		await addHoodieToCart.click()
```

This is uses the <a ... > tag property 'data-product_id' to locate the specific link button we would like to click on.

## Using CSS Selectors

You can also use an object link or button's CSS properties to locate and click as follows:

```typescript

		let lnkProceedToCheckout = await browser.findElement(By.css('#post-14 > div > div > div > div > div > a'))
		await lnkProceedToCheckout.click()
```

## Extended example

For applications that may require a more stable scripting approach due to variations observed in performance - you may wish to include some extra steps around waiting for objects to appear.

```typescript
		let lnkProceedToCheckout = By.css('#post-14 > div > div > div > div > div > a')
		await browser.wait(Until.elementIsVisible(lnkProceedToCheckout))
		let element = await browser.findElement(lnkProceedToCheckout)
		await element.focus()
		await element.click()
```

Here we wait for an element to be visible before proceeding as well as ensure we have application focus on the element before we click on it.

































































































































































