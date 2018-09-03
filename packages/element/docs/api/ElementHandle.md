---
title: ''
---
# `ElementHandle`

Example Handle represents a remote element in the DOM of the browser. It implements useful methods for querying and interacting with this DOM element.

All methods on this class are asynchronous and must be used with `await` to wait for the result to fulfill from the browser.

#### methods
#### `ElementHandle.blur()`
* returns: &lt;[Promise]&lt;void&gt;&gt; 

Clears focus from this element so that it will no longer receive keyboard inputs.

#### `ElementHandle.clear()`
* returns: &lt;[Promise]&lt;void&gt;&gt; 

Schedules a command to clear the value of this element.
This command has no effect if the underlying DOM element is neither a text
INPUT, SELECT, or a TEXTAREA element.

#### `ElementHandle.click([, options])`
* `options` &lt;[ClickOptions]&gt; (Optional) 
* returns: &lt;[Promise]&lt;void&gt;&gt; 

Sends a click event to the element attached to this handle. If the element is
currently outside the viewport it will first scroll to that element.

#### `ElementHandle.findElement(locator)`
* `locator` &lt;string|[Locator]&gt;  
* returns: &lt;[Promise]&lt;[ElementHandle]|null&gt;&gt; 

Locates an element using the supplied <[Locator]>, returning an <[ElementHandle]>.

#### `ElementHandle.findElements(locator)`
* `locator` &lt;[Locator]|string&gt;  
* returns: &lt;[Promise]&lt;[ElementHandle][]&gt;&gt; 

Locates all elements using the supplied <[Locator]>, returning an array of <[ElementHandle]>s.

#### `ElementHandle.focus()`
* returns: &lt;[Promise]&lt;void&gt;&gt; 

Sends focus to this element so that it receives keyboard inputs.

#### `ElementHandle.getAttribute(key)`
* `key` &lt;string&gt;  
* returns: &lt;[Promise]&lt;string|null&gt;&gt; 

Fetches the value of an attribute on this element

#### `ElementHandle.getId()`
* returns: &lt;[Promise]&lt;string|null&gt;&gt; 

Fetches the remote elements `id` attribute.

#### `ElementHandle.highlight()`
* returns: &lt;[Promise]&lt;void&gt;&gt; 

#### `ElementHandle.isDisplayed()`
* returns: &lt;[Promise]&lt;boolean&gt;&gt; 

Checks whether the remote element is displayed in the DOM and is visible to the user without being hidden by CSS or occluded by another element.

#### `ElementHandle.isEnabled()`
* returns: &lt;[Promise]&lt;boolean&gt;&gt; 

Checks whether the remote element is enabled. Typically this means it does not have a `disabled` property or attribute applied.

#### `ElementHandle.isSelectable()`
* returns: &lt;[Promise]&lt;boolean&gt;&gt; 

Checks whether the remote element is selectable. An element is selectable if it is an `<option>` or `input[type="checkbox"]` or radio button.

#### `ElementHandle.isSelected()`
* returns: &lt;[Promise]&lt;boolean&gt;&gt; 

If the remote element is selectable (such as an `<option>` or `input[type="checkbox"]`) this methos will indicate whether it is selected.

#### `ElementHandle.location()`
* returns: &lt;[Promise]&lt;{"y":"number","x":"number"}&gt;&gt; 

Fetches the remote elements physical location as `x` and `y`.

#### `ElementHandle.sendKeys(keys)`
* `keys` &lt;string[]&gt;  
* returns: &lt;[Promise]&lt;void&gt;&gt; 

Sends a series of key modifiers to the element.

#### `ElementHandle.size()`
* returns: &lt;[Promise]&lt;{"width":"number","height":"number"}&gt;&gt; 

Fetches the remote elements physical dimensions as `width` and `height`.

#### `ElementHandle.tagName()`
* returns: &lt;[Promise]&lt;string|null&gt;&gt; 

Fetches the remote elements `tagName` property.

#### `ElementHandle.takeScreenshot([, options])`
* `options` &lt;[ScreenshotOptions]&gt; (Optional) 
* returns: &lt;[Promise]&lt;void&gt;&gt; 

Takes a screenshot of this element and saves it to the results folder with a random name.

#### `ElementHandle.text()`
* returns: &lt;[Promise]&lt;string&gt;&gt; 

Retrieves the text content of this element excluding leading and trailing whitespace.

#### `ElementHandle.type(text)`
* `text` &lt;string&gt;  
* returns: &lt;[Promise]&lt;void&gt;&gt; 

Sends a series of key presses to the element to simulate a user typing on the keyboard. Use this to fill in input fields.


[Promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
[ClickOptions]: ../../api/Browser.md#clickoptions
[Locator]: ../../api/By.md#locator
[ElementHandle]: ../../api/ElementHandle.md#elementhandle
[ScreenshotOptions]: ../../api/Browser.md#screenshotoptions