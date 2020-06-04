---
id: target-locator
title: TargetLocator
hide_title: true
---

# `TargetLocator`

The target locator is accessed through [`browser.switchTo()`](api/../Browser.md#switchto) and enables you to switch frames, tabs, or browser windows. As well as access the `activeElement` or an alert box.

## Methods

### `TargetLocator.activeElement()`

Locates the DOM element on the current page that corresponds to
`document.activeElement` or `document.body` if the active element is not
available.

**Parameters**

- returns: [Promise&lt;[`ElementHandle`][ElementHandle] \| `null`\>][promise]

### `TargetLocator.defaultContent()`

Navigates to the topmost frame

**Parameters**

- returns: [Promise&lt;`void`\>][promise]

### `TargetLocator.frame(id)`

Changes the active target to another frame.

Accepts either:

number: Switch to frame by index in window.frames,
string: Switch to frame by frame.name or frame.id, whichever matches first,
ElementHandle: Switch to a frame using the supplied ElementHandle of a frame.

**Parameters**

- id `number` \| `string` \| [`ElementHandle`][elementhandle] number | string | ElementHandle
- returns: [Promise&lt;`void`\>][promise]

[promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
[elementhandle]: ElementHandle
