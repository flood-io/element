# `ElementHandle`

Example Handle represents a remote element in the DOM of the browser. It implements useful methods for querying and interacting with this DOM element.

All methids on this class are asynchronous and must be used with `await` to wait for the result to fulfill from the browser.

#### `elementHandle.blur()`
* returns: <[Promise]<void>> 

Clears focus from this element so that it will no longer receive keyboard inputs.

#### `elementHandle.clear()`
* returns: <[Promise]<void>> 

Schedules a command to clear the value of this element.
This command has no effect if the underlying DOM element is neither a text
INPUT, SELECT, or a TEXTAREA element.

#### `elementHandle.click([, options])`
* `options` <[ClickOptions]> (Optional) 
* returns: <[Promise]<void>> 

Sends a click event to the element attached to this handle. If the element is
currently outside the viewport it will first scroll to that element.

#### `elementHandle.findElement(locator)`
* `locator` <string|[Locator]>  
* returns: <[Promise]<[ElementHandle]|null>> 

Locates an element using the supplied <[Locator]>, returning an <[ElementHandle]>

#### `elementHandle.findElements(locator)`
* `locator` <[Locator]|string>  
* returns: <[Promise]<[ElementHandle][]>> 

Locates all elements using the supplied <[Locator]>, returning an array of <[ElementHandle]>'s

#### `elementHandle.focus()`
* returns: <[Promise]<void>> 

Sends focus to this element so that it receives keyboard inputs.

#### `elementHandle.getAttribute(key)`
* `key` <string>  
* returns: <[Promise]<string|null>> 

Fetches the value of an attribute on this element

#### `elementHandle.getId()`
* returns: <[Promise]<string|null>> 

Fetches the remote elements `id` attribute.

#### `elementHandle.isDisplayed()`
* returns: <[Promise]<boolean>> 

Checks whether the remote element is displayed in the DOM and is visible to the user without being hidden by CSS or occluded by another element.

#### `elementHandle.isEnabled()`
* returns: <[Promise]<boolean>> 

Checks whether the remote element is enabled. Typically this means it does not have a `disabled` property or attribute applied.

#### `elementHandle.isSelectable()`
* returns: <[Promise]<boolean>> 

Checks whether the remote element is selectable. An element is selectable if it is an `<option>` or `input[type="checkbox"]` or radio button.

#### `elementHandle.isSelected()`
* returns: <[Promise]<boolean>> 

If the remote element is selectable (such as an `<option>` or `input[type="checkbox"]`) this methos will indicate whether it is selected.

#### `elementHandle.location()`
* returns: <[Promise]<{"y":"number","x":"number"}>> 

Fetches the remote elements physical location as `x` and `y`.

#### `elementHandle.sendKeys(keys)`
* `keys` <string[]>  
* returns: <[Promise]<void>> 

Sends a series of key modifiers to the element.

#### `elementHandle.size()`
* returns: <[Promise]<{"width":"number","height":"number"}>> 

Fetches the remote elements physical dimensions as `width` and `height`.

#### `elementHandle.tagName()`
* returns: <[Promise]<string|null>> 

Fetches the remote elements `tagName` property.

#### `elementHandle.takeScreenshot([, options])`
* `options` <[ScreenshotOptions]> (Optional) 
* returns: <[Promise]<void>> 

Takes a screenshot of this element and saves it to the results folder with a random name.

#### `elementHandle.text()`
* returns: <[Promise]<string>> 

Retrieves the text content of this element excluding leading and trailing whitespace.

#### `elementHandle.type(text)`
* `text` <string>  
* returns: <[Promise]<void>> 

Sends a series of key presses to the element to simulate a user typing on the keyboard. Use this to fill in input fields.


[Promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
[ClickOptions]: Interfaces.md#clickoptions
[Locator]: Locator.md#locator
[ScreenshotOptions]: Interfaces.md#screenshotoptions