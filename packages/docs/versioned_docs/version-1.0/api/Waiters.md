---
title: Waiters
id: waiters
---

In any asynchronous testing environment, you need to wait for things to happen in order to build robust tests, and measure the quality of components that take time to change state.

Element comes with a deep set of helpers to handle waiting for elements to appear, become enabled, or change state in other ways.

In most cases you don't want to wait for every element to appear before interacting with it, because it wouldn't make sense to interact with an invisble element. Flood Element supports automatic waiting, using the `autoWait` option — enabled by default since Element v1.2.

# `Condition`

A Condition represents a predicate which can be used to wait for an [ElementHandle][elementhandle]. They are generally created by using [Until](#until)'s helper methods.

# `Until`

Until contains a set of useful methods to support waiting for specific state changes on a page. Under the hood, each state change is evaluated using reactive methods of the browser (`requestAnimationFrame` and change observers), instead of timers as used in most other testing tools. This means that state changes are detected as they happen, instead of polling the page continuously to check if they happened. This approach greatly improves performance.

Conditions represent predicates used to wait for something to become true, such as waiting for elements to become active, visible, invisible or disabled on the page.

You typically use these to control the flow of you test.

## Methods

### `Until.ableToSwitchToFrame(frame)`

Creates a condition that will wait until the input driver is able to switch to the designated frame.

The target frame may be specified as:

- string name of the frame to wait for matching the frame's `name` or `id` attribute.
- locator which may be used to first locate a FRAME or IFRAME on the current page before attempting to switch to it.

Upon successful resolution of this condition, the driver will be left focused on the new frame.

**Example:**

```typescript
step('Switch frame', async browser => {
  await browser.wait(Until.ableToSwitchToFrame('frame1'))
  ...
})
```

**Parameters**

- frame [`Locatable`][locatable]
- returns: [`Condition`][condition]

### `Until.alertIsPresent()`

Creates a condition that waits for an alert to be opened. Upon success,
the returned promise will be fulfilled with the handle for the opened alert.

**Example:**

```typescript
step("Handle alert", async (browser) => {
  let dialog = await browser.wait(Until.alertIsPresent());
  await dialog.accept();
});
```

**Parameters**

- returns: [`Condition`][condition]

### `Until.elementIsDisabled(selectorOrLocator)`

Creates a condition that will wait for the given element to be disabled

**Example:**

```typescript
step("Element state", async (browser) => {
  let btnLocator = By.css("button.submit");
  await browser.wait(Until.elementIsDisabled(btnLocator));
  let element = await browser.findElement(btnLocator);
  // element disabled attribute should be true
});
```

**Parameters**

- selectorOrLocator [`NullableLocatable`][nullablelocatable] A [Locatable][] to use to find the element.
- returns: [`Condition`][condition]

### `Until.elementIsEnabled(selectorOrLocator)`

Creates a condition that will wait for the given element to be enabled

**Parameters**

- selectorOrLocator [`NullableLocatable`][nullablelocatable] A [Locatable][] to use to find the element.
- returns: [`Condition`][condition]

### `Until.elementIsNotSelected(selectorOrLocator)`

Creates a condition that will wait for the given element to be in the DOM, yet not visible to the user

**Parameters**

- selectorOrLocator [`NullableLocatable`][nullablelocatable] A [Locatable][] to use to find the element.
- returns: [`Condition`][condition]

### `Until.elementIsSelected(selectorOrLocator)`

Creates a condition that will wait for the given element to be selected.

**Parameters**

- selectorOrLocator [`NullableLocatable`][nullablelocatable] A [Locatable][] to use to find the element.
- returns: [`Condition`][condition]

### `Until.elementIsNotVisible(selectorOrLocator)`

Creates a condition that will wait for the given element to become invisible.

Example:

```typescript
step("Step 1", async (browser) => {
  await browser.click(By.css(".hide-panel"));
  await browser.wait(Until.elementIsNotVisible(By.id("btn")));
});
```

**Parameters**

- selectorOrLocator [`NullableLocatable`][nullablelocatable] A [Locatable][] to use to find the element.
- returns: [`Condition`][condition]


### `Until.elementIsVisible(selectorOrLocator)`

Creates a condition that will wait for the given element to become visible.

Example:

```typescript
step("Step 1", async (browser) => {
  await browser.wait(Until.elementIsVisible(By.partialLinkText("Start")));
});
```

**Parameters**

- selectorOrLocator [`NullableLocatable`][nullablelocatable] A [Locatable][] to use to find the element.
- returns: [`Condition`][condition]

### `Until.elementLocated(selectorOrLocator)`

Creates a condition which will wait until the element is located on the page.

**Parameters**

- selectorOrLocator [`NullableLocatable`][nullablelocatable]
- returns: [`Condition`][condition]

### `Until.elementsLocated(selectorOrLocator, desiredCount)`

Creates a condition that will wait until at least the desired number of elements are found.

**Parameters**

- selectorOrLocator [`NullableLocatable`][nullablelocatable]
- desiredCount `number` (Optional, default: `1`)
- returns: [`Condition`][condition]

### `Until.elementTextContains(selectorOrLocator, text)`

Creates a condition which will wait until the element's text content contains the target text.

**Parameters**

- selectorOrLocator [`NullableLocatable`][nullablelocatable]
- text `string`
- returns: [`Condition`][condition]

### `Until.elementTextDoesNotContain(selectorOrLocator, text)`

Creates a condition which will wait until the element's text content no longer contains the target text.

**Parameters**

- selectorOrLocator [`NullableLocatable`][nullablelocatable]
- text `string`
- returns: [`Condition`][condition]

### `Until.elementTextIs(selectorOrLocator, text)`

Creates a condition which will wait until the element's text exactly matches the target text, excluding leading and trailing whitespace.

**Parameters**

- selectorOrLocator [`NullableLocatable`][nullablelocatable]
- text `string`
- returns: [`Condition`][condition]

### `Until.elementTextIsNot(selectorOrLocator, text)`

Creates a condition which will wait until the element's text becomes different from the target text, excluding leading and trailing whitespace.

**Parameters**

- selectorOrLocator [`NullableLocatable`][nullablelocatable]
- text `string`
- returns: [`Condition`][condition]

### `Until.elementTextMatches(selectorOrLocator, regex)`

Creates a condition which will wait until the element's text matches the target Regular Expression.

**Parameters**

- selectorOrLocator [`NullableLocatable`][nullablelocatable]
- regex [`RegExp`][regexp]
- returns: [`Condition`][condition]


### `Until.titleContains(title)`

Creates a condition which waits until the page title contains the expected text.

**Parameters**

- title `string`
- returns: [`Condition`][condition]

### `Until.titleDoesNotContain(title)`

Creates a condition which waits until the page title no longer contains the expected text.

**Parameters**

- title `string`
- returns: [`Condition`][condition]

### `Until.titleIs(title)`

Creates a condition which waits until the page title exactly matches the expected text.

**Parameters**

- title `string`
- returns: [`Condition`][condition]

### `Until.titleIsNot(title)`

Creates a condition which waits until the page title does not match the expected text.

**Parameters**

- title `string`
- returns: [`Condition`][condition]

### `Until.titleMatches(regex)`

Creates a condition which waits until the page title matches the title `RegExp`.

**Parameters**

- title [`RegExp`][regexp]
- returns: [`Condition`][condition]

### `Until.titleDoesNotMatch(regex)`

Creates a condition which waits until the page title no longer matches the title `RegExp`.

**Parameters**

- title [`RegExp`][regexp]
- returns: [`Condition`][condition]

### `Until.urlContains(url)`

Creates a condition which waits until the page URL contains the expected path.

**Parameters**

- url `string`
- returns: [`Condition`][condition]

### `Until.urlDoesNotContain(url)`

Creates a condition which waits until the page URL does not contain the expected path.

**Parameters**

- url `string`
- returns: [`Condition`][condition]

### `Until.urlIs(url)`

Creates a condition which waits until the page URL exactly matches the expected URL.

**Parameters**

- url `string`
- returns: [`Condition`][condition]

### `Until.urlIsNot(url)`

Creates a condition which waits until the page URL does not exactly matches the expected URL.

**Parameters**

- url `string`
- returns: [`Condition`][condition]

### `Until.urlMatches(regex)`

Creates a condition which waits until the page URL matches the supplied `RegExp`.

**Parameters**

- url [`RegExp`][regexp]
- returns: [`Condition`][condition]

### `Until.urlDoesNotMatch(regex)`

Creates a condition which waits until the page URL does not match the supplied `RegExp`.

**Parameters**

- url [`RegExp`][regexp]
- returns: [`Condition`][condition]

[elementhandle]: element-handle
[until]: Waiters#until
[condition]: Waiters#condition
[locatable]: Browser#locatable
[condition]: Waiters
[nullablelocatable]: Browser#nullableLocatable
[regexp]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp
