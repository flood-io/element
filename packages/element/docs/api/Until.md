---
title: ''
---
# `Until`

Until is used to create wait <[Conditions]> which are used to wait for elements to become active, visible, invisible or disabled on the page.

You would typically use these to control the flow of you test.

#### `until.ableToSwitchToFrame(frame)`
* `frame` <string|number|[Locatable]>  
* returns: <[Condition]> 

Creates a condition that will wait until the input driver is able to switch to the designated frame.

The target frame may be specified as:
- string name of the frame to wait for matching the frame's `name` or `id` attribute.
- (Coming soon) numeric index into window.frames for the currently selected frame.
- (Coming soon) locator which may be used to first locate a FRAME or IFRAME on the current page before attempting to switch to it.

Upon successful resolution of this condition, the driver will be left focused on the new frame.

#### `until.alertIsPresent(alertText)`
* `alertText` <string>  
* returns: <[Condition]> 

Creates a condition that waits for an alert to be opened. Upon success, the returned promise will be fulfilled with the handle for the opened alert

#### `until.elementIsDisabled(locatable)`
* `locatable` <[Locatable]>  
* returns: <[Condition]> 

Creates a condition that will wait for the given element to be disabled

#### `until.elementIsEnabled(locatable)`
* `locatable` <[Locatable]>  
* returns: <[Condition]> 

Creates a condition that will wait for the given element to be enabled

#### `until.elementIsNotSelected(locatable)`
* `locatable` <[Locatable]>  
* returns: <[Condition]> 

Creates a condition that will wait for the given element to be in the DOM, yet not visible to the user

#### `until.elementIsNotVisible(locatable)`
* `locatable` <[Locatable]>  
* returns: <[Condition]> 

Creates a condition that will wait for the given element to become visible.

Example:
```typescript
step("Step 1", async browser => {
	 await browser.click(By.css('.hide-panel'))
  await browser.wait(Until.elementIsNotVisible(By.id("btn")))
})
```

#### `until.elementIsSelected(locatable)`
* `locatable` <[Locatable]>  
* returns: <[Condition]> 

Creates a condition that will wait for the given element to be deselected.

#### `until.elementIsVisible(locatable)`
* `locatable` <[Locatable]>  
* returns: <[Condition]> 

Creates a condition that will wait for the given element to be selected.

Example:
```typescript
step("Step 1", async browser => {
  await browser.wait(Until.elementIsVisible(By.partialLinkText("Start")))
})
```

#### `until.elementLocated(locatable)`
* `locatable` <[Locatable]>  
* returns: <[Condition]> 

Creates a condition which will wait until the element is located on the page.

#### `until.elementTextContains(locatable, text)`
* `locatable` <[Locatable]>  
* `text` <string>  
* returns: <[Condition]> 

Creates a condition which will wait until the element's text content contains the target text.

#### `until.elementTextIs(locatable, text)`
* `locatable` <[Locatable]>  
* `text` <string>  
* returns: <[Condition]> 

Creates a condition which will wait until the element's text exactly matches the target text, excluding leading and trailing whitespace.

#### `until.elementTextMatches(locatable, regex)`
* `locatable` <[Locatable]>  
* `regex` <[RegExp]>  
* returns: <[Condition]> 

Creates a condition which will wait until the element's text matches the target Regular Expression.

#### `until.elementsLocated(selectorOrLocator)`
* `selectorOrLocator` <[Locator]|string>  
* returns: <[Condition]> 

Creates a condition that will loop until at least one element is found with the given locator.

#### `until.stalenessOf(selectorOrLocator)`
* `selectorOrLocator` <[Locator]|string>  
* returns: <[Condition]> 

Creates a condition that will wait for the given element to become stale.

An element is considered stale once it is removed from the DOM, or a new page has loaded.

#### `until.titleContains(title)`
* `title` <string>  
* returns: <[Condition]> 

Creates a condition which waits until the page title contains the expected text.

#### `until.titleIs(title)`
* `title` <string>  
* returns: <[Condition]> 

Creates a condition which waits until the page title exactly matches the expected text.

#### `until.titleMatches(title)`
* `title` <[RegExp]>  
* returns: <[Condition]> 

Creates a condition which waits until the page title matches the title `RegExp`.

#### `until.urlContains(url)`
* `url` <string>  
* returns: <[Condition]> 

Creates a condition which waits until the page URL contains the expected path.

#### `until.urlIs(url)`
* `url` <string>  
* returns: <[Condition]> 

Creates a condition which waits until the page URL exactly matches the expected URL.

#### `until.urlMatches(url)`
* `url` <[RegExp]>  
* returns: <[Condition]> 

Creates a condition which waits until the page URL matches the supplied `RegExp`.


[Locatable]: Interfaces.md#locatable
[Condition]: Condition.md#condition
[Locator]: Locator.md#locator