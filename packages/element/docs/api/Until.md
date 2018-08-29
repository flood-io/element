---
title: ''
---
# `Condition`

A Condition represents a predicate which can be used to wait for an <[ElementHandle]>. They are generally created by using <[Until]>'s helper methods.

# `Until`

Until is used to create wait <[Condition]>s which are used to wait for a predicate to become true.

Predicates include waiting for elements to become active, visible, invisible or disabled on the page.

You would typically use these to control the flow of you test.


#### `until.ableToSwitchToFrame(frame)`
* `frame` &lt;[Locatable]&gt;  
* returns: &lt;[Condition]&gt; 

Creates a condition that will wait until the input driver is able to switch to the designated frame.

The target frame may be specified as:
- string name of the frame to wait for matching the frame's `name` or `id` attribute.
- (Coming soon) numeric index into window.frames for the currently selected frame.
- (Coming soon) locator which may be used to first locate a FRAME or IFRAME on the current page before attempting to switch to it.

Upon successful resolution of this condition, the driver will be left focused on the new frame.

#### `until.alertIsPresent()`
* returns: &lt;[Condition]&gt; 

Creates a condition that waits for an alert to be opened. Upon success,
the returned promise will be fulfilled with the handle for the opened alert.

#### `until.elementIsDisabled(selectorOrLocator)`
* `selectorOrLocator` &lt;[NullableLocatable]&gt;  A <[Locatable]> to use to find the element.

* returns: &lt;[Condition]&gt; 

Creates a condition that will wait for the given element to be disabled

#### `until.elementIsEnabled(selectorOrLocator)`
* `selectorOrLocator` &lt;[NullableLocatable]&gt;  A <[Locatable]> to use to find the element.

* returns: &lt;[Condition]&gt; 

Creates a condition that will wait for the given element to be enabled

#### `until.elementIsNotSelected(selectorOrLocator)`
* `selectorOrLocator` &lt;[NullableLocatable]&gt;  A <[Locatable]> to use to find the element.

* returns: &lt;[Condition]&gt; 

Creates a condition that will wait for the given element to be in the DOM, yet not visible to the user

#### `until.elementIsNotVisible(selectorOrLocator)`
* `selectorOrLocator` &lt;[NullableLocatable]&gt;  A <[Locatable]> to use to find the element.

* returns: &lt;[Condition]&gt; 

Creates a condition that will wait for the given element to become visible.

Example:
```typescript
step("Step 1", async browser => {
	 await browser.click(By.css('.hide-panel'))
  await browser.wait(Until.elementIsNotVisible(By.id("btn")))
})
```

#### `until.elementIsSelected(selectorOrLocator)`
* `selectorOrLocator` &lt;[NullableLocatable]&gt;  A <[Locatable]> to use to find the element.

* returns: &lt;[Condition]&gt; 

Creates a condition that will wait for the given element to be deselected.

#### `until.elementIsVisible(selectorOrLocator)`
* `selectorOrLocator` &lt;[NullableLocatable]&gt;  A <[Locatable]> to use to find the element.

* returns: &lt;[Condition]&gt; 

Creates a condition that will wait for the given element to be selected.

Example:
```typescript
step("Step 1", async browser => {
  await browser.wait(Until.elementIsVisible(By.partialLinkText("Start")))
})
```

#### `until.elementLocated(selectorOrLocator)`
* `selectorOrLocator` &lt;[NullableLocatable]&gt;  
* returns: &lt;[Condition]&gt; 

Creates a condition which will wait until the element is located on the page.

#### `until.elementTextContains(selectorOrLocator, text)`
* `selectorOrLocator` &lt;[NullableLocatable]&gt;  
* `text` &lt;string&gt;  
* returns: &lt;[Condition]&gt; 

Creates a condition which will wait until the element's text content contains the target text.

#### `until.elementTextIs(selectorOrLocator, text)`
* `selectorOrLocator` &lt;[NullableLocatable]&gt;  
* `text` &lt;string&gt;  
* returns: &lt;[Condition]&gt; 

Creates a condition which will wait until the element's text exactly matches the target text, excluding leading and trailing whitespace.

#### `until.elementTextMatches(selectorOrLocator, regex)`
* `selectorOrLocator` &lt;[NullableLocatable]&gt;  
* `regex` &lt;[RegExp]&gt;  
* returns: &lt;[Condition]&gt; 

Creates a condition which will wait until the element's text matches the target Regular Expression.

#### `until.elementsLocated(selectorOrLocator, desiredCount)`
* `selectorOrLocator` &lt;[NullableLocatable]&gt;  
* `desiredCount` &lt;number&gt;  
* returns: &lt;[Condition]&gt; 

Creates a condition that will wait until at least the desired number of elements are found.

#### `until.titleContains(title)`
* `title` &lt;string&gt;  
* returns: &lt;[Condition]&gt; 

Creates a condition which waits until the page title contains the expected text.

#### `until.titleIs(title)`
* `title` &lt;string&gt;  
* returns: &lt;[Condition]&gt; 

Creates a condition which waits until the page title exactly matches the expected text.

#### `until.titleMatches(title)`
* `title` &lt;[RegExp]&gt;  
* returns: &lt;[Condition]&gt; 

Creates a condition which waits until the page title matches the title `RegExp`.

#### `until.urlContains(url)`
* `url` &lt;string&gt;  
* returns: &lt;[Condition]&gt; 

Creates a condition which waits until the page URL contains the expected path.

#### `until.urlIs(url)`
* `url` &lt;string&gt;  
* returns: &lt;[Condition]&gt; 

Creates a condition which waits until the page URL exactly matches the expected URL.

#### `until.urlMatches(url)`
* `url` &lt;[RegExp]&gt;  
* returns: &lt;[Condition]&gt; 

Creates a condition which waits until the page URL matches the supplied `RegExp`.


[ElementHandle]: ../../api/ElementHandle.md#elementhandle
[Condition]: ../../api/Until.md#condition
[Locatable]: ../../api/Browser.md#locatable
[NullableLocatable]: ../../api/Browser.md#nullablelocatable

[ElementHandle]: ../../api/ElementHandle.md#elementhandle