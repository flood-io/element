---
title: ''
---
# `ElementHandle`

Example Handle represents a remote element in the DOM of the browser. It implements useful methods for querying and interacting with this DOM element.

All methids on this class are asynchronous and must be used with `await` to wait for the result to fulfill from the browser.

#### `elementHandle.bindBrowser(browser)`
* `browser` &lt;any&gt;  
* returns: &lt;void&gt; 

internal

#### `elementHandle.blur()`
* returns: &lt;[Promise]&lt;void&gt;&gt; 

Clears focus from this element so that it will no longer receive keyboard inputs.

#### `elementHandle.clear()`
* returns: &lt;[Promise]&lt;void&gt;&gt; 

Schedules a command to clear the value of this element.
This command has no effect if the underlying DOM element is neither a text
INPUT, SELECT, or a TEXTAREA element.

#### `elementHandle.click([, options])`
* `options` &lt;[ClickOptions]&gt; (Optional) 
* returns: &lt;[Promise]&lt;void&gt;&gt; 

Sends a click event to the element attached to this handle. If the element is
currently outside the viewport it will first scroll to that element.

#### `elementHandle.findElement(locator)`
* `locator` &lt;string|[Locator]&gt;  
* returns: &lt;[Promise]&lt;[ElementHandle]|null&gt;&gt; 

Locates an element using the supplied <[Locator]>, returning an <[ElementHandle]>

#### `elementHandle.findElements(locator)`
* `locator` &lt;[Locator]|string&gt;  
* returns: &lt;[Promise]&lt;[ElementHandle][]&gt;&gt; 

Locates all elements using the supplied <[Locator]>, returning an array of <[ElementHandle]>'s

#### `elementHandle.focus()`
* returns: &lt;[Promise]&lt;void&gt;&gt; 

Sends focus to this element so that it receives keyboard inputs.

#### `elementHandle.getAttribute(key)`
* `key` &lt;string&gt;  
* returns: &lt;[Promise]&lt;string|null&gt;&gt; 

Fetches the value of an attribute on this element

#### `elementHandle.getId()`
* returns: &lt;[Promise]&lt;string|null&gt;&gt; 

Fetches the remote elements `id` attribute.

#### `elementHandle.highlight()`
* returns: &lt;[Promise]&lt;void&gt;&gt; 

#### `elementHandle.isDisplayed()`
* returns: &lt;[Promise]&lt;boolean&gt;&gt; 

Checks whether the remote element is displayed in the DOM and is visible to the user without being hidden by CSS or occluded by another element.

#### `elementHandle.isEnabled()`
* returns: &lt;[Promise]&lt;boolean&gt;&gt; 

Checks whether the remote element is enabled. Typically this means it does not have a `disabled` property or attribute applied.

#### `elementHandle.isSelectable()`
* returns: &lt;[Promise]&lt;boolean&gt;&gt; 

Checks whether the remote element is selectable. An element is selectable if it is an `<option>` or `input[type="checkbox"]` or radio button.

#### `elementHandle.isSelected()`
* returns: &lt;[Promise]&lt;boolean&gt;&gt; 

If the remote element is selectable (such as an `<option>` or `input[type="checkbox"]`) this methos will indicate whether it is selected.

#### `elementHandle.location()`
* returns: &lt;[Promise]&lt;{"y":"number","x":"number"}&gt;&gt; 

Fetches the remote elements physical location as `x` and `y`.

#### `elementHandle.sendKeys(keys)`
* `keys` &lt;string[]&gt;  
* returns: &lt;[Promise]&lt;void&gt;&gt; 

Sends a series of key modifiers to the element.

#### `elementHandle.size()`
* returns: &lt;[Promise]&lt;{"width":"number","height":"number"}&gt;&gt; 

Fetches the remote elements physical dimensions as `width` and `height`.

#### `elementHandle.tagName()`
* returns: &lt;[Promise]&lt;string|null&gt;&gt; 

Fetches the remote elements `tagName` property.

#### `elementHandle.takeScreenshot([, options])`
* `options` &lt;[ScreenshotOptions]&gt; (Optional) 
* returns: &lt;[Promise]&lt;void&gt;&gt; 

Takes a screenshot of this element and saves it to the results folder with a random name.

#### `elementHandle.text()`
* returns: &lt;[Promise]&lt;string&gt;&gt; 

Retrieves the text content of this element excluding leading and trailing whitespace.

#### `elementHandle.toErrorString()`
* returns: &lt;string&gt; 

#### `elementHandle.type(text)`
* `text` &lt;string&gt;  
* returns: &lt;[Promise]&lt;void&gt;&gt; 

Sends a series of key presses to the element to simulate a user typing on the keyboard. Use this to fill in input fields.


[Promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
[Locator]: ../../api/By.md#locator