---
title: ''
---
# `TargetLocator`

The target locator is accessed through `browser.switchTo()` and enables you to switch frames, tabs, or browser windows. As well as access the `activeElement` or an alert box.

#### `targetLocator.activeElement()`
* returns: <[Promise]<[ElementHandle]|null>> 

Locates the DOM element on the current page that corresponds to
`document.activeElement` or `document.body` if the active element is not
available.

#### `targetLocator.defaultContent()`
* returns: <[Promise]<void>> 

Navigates to the topmost frame

#### `targetLocator.frame(id)`
* `id` <number|string|[ElementHandle]>  number | string | ElementHandle
* returns: <[Promise]<void>> 

Changes the active target to another frame.

Accepts either:

number: Switch to frame by index in window.frames,
string: Switch to frame by frame.name or frame.id, whichever matches first,
ElementHandle: Switch to a frame using the supplied ElementHandle of a frame.


[Promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
[ElementHandle]: ElementHandle.md#elementhandle