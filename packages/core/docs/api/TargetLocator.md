---
title: ''
---

# `TargetLocator`

The target locator is accessed through `browser.switchTo()` and enables you to switch frames, tabs, or browser windows. As well as access the `activeElement` or an alert box.

#### methods

#### `TargetLocator.activeElement()`

- returns: &lt;[Promise]&lt;[ElementHandle] | null&gt;&gt;

Locates the DOM element on the current page that corresponds to
`document.activeElement` or `document.body` if the active element is not
available.

#### `TargetLocator.defaultContent()`

- returns: &lt;[Promise]&lt;void&gt;&gt;

Navigates to the topmost frame

#### `TargetLocator.frame(id)`

- `id` &lt;number | string | [ElementHandle]&gt; number | string | ElementHandle

- returns: &lt;[Promise]&lt;void&gt;&gt;

Changes the active target to another frame.

Accepts either:

number: Switch to frame by index in window.frames,
string: Switch to frame by frame.name or frame.id, whichever matches first,
ElementHandle: Switch to a frame using the supplied ElementHandle of a frame.

[promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
[elementhandle]: ../../api/ElementHandle.md#elementhandle
