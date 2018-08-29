---
title: Examples - Web Form Interaction
---

# Examples - Web Form Interaction

## Overview

Web-based forms occur in the vast majority of interactive web applications and therefore require to be supported. Flood Element makes it easy to interact with common UI form controls.

## Interacting with Text Fields using IDs

The simplest way to enter text and interact with standar text field entry is to find the ID of the form field and use the following example:

```typescript
        await browser.type(By.id('billing_first_name'), "Jason")
``` 

## Interacting with Text Fields using CSS Selectors

You can also use the CSS selector to interact with a text entry field as follows:

```typescript
        await browser.type(By.css('#billing_first_name'), "Jason")
``` 

## Interacting with Text Fields using XPath

You can also use XPath to interact with a text entry field as follows:

```typescript
        await browser.type(By.xpath('//*[@id="billing_first_name"]'), "Jason")
``` 

## Interacting with Dropdown listboxes

Dropdown listbox values can simply be chosen by using the selectByValue function as in the following example:

```typescript
        await browser.selectByValue(By.id('challenger_age'), '28')
``` 
































































































































































