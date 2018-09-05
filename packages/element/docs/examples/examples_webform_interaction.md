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

## More information

For more information on the available actions, see [Browser] and [ElementHandle]

<!-- suffix -->

[Browser]: ../../api/Browser.md#browser
[ElementHandle]: ../../api/ElementHandle.md#elementhandle