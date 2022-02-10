---
id: mouse
title: 'Mouse interaction'
hide_title: true
---

# `Mouse`

## Methods

### `Mouse.click(x, y[, options])`

- `x` &lt;number&gt;
- `y` &lt;number&gt;
- `options` &lt;Object&gt; &lt;[ClickOptions]&gt; (Optional)
- returns: &lt;[Promise]&gt;

Shortcut for `mouse.move`, `mouse.down` and `mouse.up`.

### `Mouse.down([, options])`

- `options` &lt;Object&gt; (Optional)
  - `button`: `"left"`|`"right"`|`"middle"` Defaults to `left`. (Optional)
  - `clickCount` &lt;number&lt; Defaults to 1. (Optional)
- returns: &lt;[Promise];&gt;

Dispatches a `mousedown` event

### `Mouse.drag(point1, point2)`

- `point` is an array of `x` (number) and `y` (number) co-ordinate
- returns: &lt;[Promise]&gt;

Shortcut for `mouse.move`, `mouse.down`, `mouse.move` and `mouse.up`.

### `Mouse.move(x, y[, options])`

- `x` &lt;number&gt;
- `y` &lt;number&gt;
- returns: &lt;[Promise]&gt;

Dispatches a `mousemove` event

### `Mouse.up([, options])`

- `options` &lt;Object&gt; (Optional)
  - `button`: `"left"`|`"right"`|`"middle"` Defaults to `left`. (Optional)
  - `clickCount` &lt;number&lt; Defaults to 1. (Optional)
- returns: &lt;[Promise]&lt;void&gt;&gt;

Dispatches a `mouseup` event

# ClickOptions

**Properties**

- `button`: `"left"`|`"right"`|`"middle"` Defaults to `left`. (Optional)
- `clickCount` &lt;number&lt; Defaults to 1. (Optional)
- `delay` &lt;number&gt; (Optional) Time to wait between mousedown and mouseup in milliseconds.

[clickoptions]: #clickoptions
[promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
