---
title: ''
---
# `Condition`

A Condition represents a predicate which can be used to wait for an <[ElementHandle]>. They are generally created by using <[Until]>'s helper methods.

# `Until`

Until contains a wealth of useful <Condition>s.

<[Condition]>s represent predicates used to wait for something to become true.

These predicates include waiting for elements to become active, visible, invisible or disabled on the page.

You typically use these to control the flow of you test.


#### methods
#### `Until.ableToSwitchToFrame(frame)`
* `frame` &lt;[Locatable]&gt;   
* returns: &lt;[Condition]&gt; 

Creates a condition that will wait until the input driver is able to switch to the designated frame.

The target frame may be specified as:
- string name of the frame to wait for matching the frame's `name` or `id` attribute.
- (Coming soon) numeric index into window.frames for the currently selected frame.
- (Coming soon) locator which may be used to first locate a FRAME or IFRAME on the current page before attempting to switch to it.

Upon successful resolution of this condition, the driver will be left focused on the new frame.

#### `Until.alertIsPresent()`
* returns: &lt;[Condition]&gt; 

Creates a condition that waits for an alert to be opened. Upon success,
the returned promise will be fulfilled with the handle for the opened alert.

#### `Until.elementIsDisabled(selectorOrLocator)`
* `selectorOrLocator` &lt;[NullableLocatable]&gt;   A <[Locatable]> to use to find the element.

* returns: &lt;[Condition]&gt; 

Creates a condition that will wait for the given element to be disabled

#### `Until.elementIsEnabled(selectorOrLocator)`
* `selectorOrLocator` &lt;[NullableLocatable]&gt;   A <[Locatable]> to use to find the element.

* returns: &lt;[Condition]&gt; 

Creates a condition that will wait for the given element to be enabled

#### `Until.elementIsNotSelected(selectorOrLocator)`
* `selectorOrLocator` &lt;[NullableLocatable]&gt;   A <[Locatable]> to use to find the element.

* returns: &lt;[Condition]&gt; 

Creates a condition that will wait for the given element to be in the DOM, yet not visible to the user

#### `Until.elementIsNotVisible(selectorOrLocator)`
* `selectorOrLocator` &lt;[NullableLocatable]&gt;   A <[Locatable]> to use to find the element.

* returns: &lt;[Condition]&gt; 

Creates a condition that will wait for the given element to become visible.

Example:
```typescript
step("Step 1", async browser => {
	 await browser.click(By.css('.hide-panel'))
  await browser.wait(Until.elementIsNotVisible(By.id("btn")))
})
```

#### `Until.elementIsSelected(selectorOrLocator)`
* `selectorOrLocator` &lt;[NullableLocatable]&gt;   A <[Locatable]> to use to find the element.

* returns: &lt;[Condition]&gt; 

Creates a condition that will wait for the given element to be deselected.

#### `Until.elementIsVisible(selectorOrLocator)`
* `selectorOrLocator` &lt;[NullableLocatable]&gt;   A <[Locatable]> to use to find the element.

* returns: &lt;[Condition]&gt; 

Creates a condition that will wait for the given element to be selected.

Example:
```typescript
step("Step 1", async browser => {
  await browser.wait(Until.elementIsVisible(By.partialLinkText("Start")))
})
```

#### `Until.elementLocated(selectorOrLocator)`
* `selectorOrLocator` &lt;[NullableLocatable]&gt;   
* returns: &lt;[Condition]&gt; 

Creates a condition which will wait until the element is located on the page.

#### `Until.elementTextContains(selectorOrLocator, text)`
* `selectorOrLocator` &lt;[NullableLocatable]&gt;   
* `text` &lt;string&gt;   
* returns: &lt;[Condition]&gt; 

Creates a condition which will wait until the element's text content contains the target text.

#### `Until.elementTextIs(selectorOrLocator, text)`
* `selectorOrLocator` &lt;[NullableLocatable]&gt;   
* `text` &lt;string&gt;   
* returns: &lt;[Condition]&gt; 

Creates a condition which will wait until the element's text exactly matches the target text, excluding leading and trailing whitespace.

#### `Until.elementTextMatches(selectorOrLocator, regex)`
* `selectorOrLocator` &lt;[NullableLocatable]&gt;   
* `regex` &lt;[RegExp]&gt;   
* returns: &lt;[Condition]&gt; 

Creates a condition which will wait until the element's text matches the target Regular Expression.

#### `Until.elementsLocated(selectorOrLocator, desiredCount)`
* `selectorOrLocator` &lt;[NullableLocatable]&gt;   
* `desiredCount` &lt;number&gt;  (Optional, default: `1)` 
* returns: &lt;[Condition]&gt; 

Creates a condition that will wait until at least the desired number of elements are found.

#### `Until.titleContains(title)`
* `title` &lt;string&gt;   
* returns: &lt;[Condition]&gt; 

Creates a condition which waits until the page title contains the expected text.

#### `Until.titleIs(title)`
* `title` &lt;string&gt;   
* returns: &lt;[Condition]&gt; 

Creates a condition which waits until the page title exactly matches the expected text.

#### `Until.titleMatches(title)`
* `title` &lt;[RegExp]&gt;   
* returns: &lt;[Condition]&gt; 

Creates a condition which waits until the page title matches the title `RegExp`.

#### `Until.urlContains(url)`
* `url` &lt;string&gt;   
* returns: &lt;[Condition]&gt; 

Creates a condition which waits until the page URL contains the expected path.

#### `Until.urlIs(url)`
* `url` &lt;string&gt;   
* returns: &lt;[Condition]&gt; 

Creates a condition which waits until the page URL exactly matches the expected URL.

#### `Until.urlMatches(url)`
* `url` &lt;[RegExp]&gt;   
* returns: &lt;[Condition]&gt; 

Creates a condition which waits until the page URL matches the supplied `RegExp`.


[ElementHandle]: ../../api/ElementHandle.md#elementhandle
[Until]: ../../api/Until.md#until
[Condition]: ../../api/Until.md#condition
[Locatable]: ../../api/Browser.md#locatable
[NullableLocatable]: ../../api/Browser.md#nullablelocatable
[RegExp]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp