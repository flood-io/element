---
title: Examples - Web Form Interaction
---

# Examples - Web Form Interaction

## Overview

Web-based forms are an important part of most interactive web applications, so let's learn how to use Flood Element to interact with them. Element makes it easy to interact with common UI form controls.

## Interacting with Text Fields using IDs

The simplest way to enter text and interact with standard text field entry is to find the ID of the form field and use the following example:

```typescript
await browser.type(By.id('billing_first_name'), "Jason")
``` 

## Interacting with Text Fields using CSS Selectors

You can also use a CSS selector to interact with a text entry field as follows:

```typescript
await browser.type(By.css('#billing_first_name'), "Jason")
``` 

## Interacting with Text Fields using XPath

XPath is also available for selecting the field you'd like to interact with:

```typescript
await browser.type(By.xpath('//*[@id="billing_first_name"]'), "Jason")
``` 

## Interacting with Dropdown listboxes

Dropdown listbox values can simply be chosen by using the selectByValue function as in the following example:

```typescript
await browser.selectByValue(By.id('challenger_age'), '28')
``` 

## Interacting with Checkboxes and Radio buttons

You only need to click a checkbox or a radio button to interact it. First, select the checkbox or radio button with your preferred method, then click it.

```typescript
await browser.click(By.css('#checkbox'))
```

## Interacting with Javascript Dropdown lists e.g. select2

The specifics will depend on how complex the javascript dropdown is. We'll start with a simple [select2][select12] dropdown. 

First, find the element that the user would click on to show the dropdown and click on it. This will differ between dropdown libraries but you can generally find it by right clicking the dropdown in your browser and choosing inspect element.

```typescript
const triggerElement = By.css('.select2-selection__rendered')
```

Trigger a click.

```typescript
await browser.click(triggerElement)
```

Then select and click on one of the options that should now be visible

```typescript
await browser.click(By.visibleText('Jason'))
```

If your dropdown has an animation to show the options, try waiting until the option becomes visible before clicking it:

```typescript
let option = By.visibleText('Jason')
await browser.wait(Until.elementIsVisible(option))
await browser.click(option)
```

[select2]: https://select2.org

## More information

For more information on the available actions, see [Browser] and [ElementHandle]

<!-- suffix -->

[Browser]: ../../api/Browser.md#browser
[ElementHandle]: ../../api/ElementHandle.md#elementhandle