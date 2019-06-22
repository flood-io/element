---
title: ''
---
# `Mouse`

#### methods
#### `Mouse.click(x, y[, options])`
* `x` &lt;number&gt;   
* `y` &lt;number&gt;   
* `options` &lt;[ClickOptions]&gt;  (Optional) 
* returns: &lt;[Promise]&lt;void&gt;&gt; 

Shortcut for `mouse.move`, `mouse.down` and `mouse.up`.

#### `Mouse.down([, options])`
* `options` &lt;[MousePressOptions]&gt;  (Optional) 
* returns: &lt;[Promise]&lt;void&gt;&gt; 

Dispatches a `mousedown` event

#### `Mouse.drag(points)`
* `points` &lt;[Point]\[]&gt;   
* returns: &lt;[Promise]&lt;void&gt;&gt; 

Shortcut for `mouse.move`, `mouse.down`, `mouse.move` and `mouse.up`.

#### `Mouse.move(points)`
* `points` &lt;[Point]\[]&gt;   
* returns: &lt;[Promise]&lt;void&gt;&gt; 

Dispatches a `mousemove` event

#### `Mouse.up([, options])`
* `options` &lt;[MousePressOptions]&gt;  (Optional) 
* returns: &lt;[Promise]&lt;void&gt;&gt; 

Dispatches a `mouseup` event

#### properties
* `browser` &lt;[Browser]&gt;       

[ClickOptions]: ../../api/Browser.md#clickoptions
[Promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
[Point]: ../..#point
[Browser]: ../../api/Browser.md#browser