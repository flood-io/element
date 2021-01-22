---
id: element-handle
title: ElementHandle
hide_title: true
---

# `ElementHandle`

Element Handle represents a remote element in the DOM of the browser. It implements useful methods for querying and interacting with DOM elements.

:::note

All methods on this class are asynchronous and must be used with `await` to wait for the result to fulfill from the browser.

:::

## Usage

```ts title="my-test.perf.ts"
step("Finding elements", async (b) => {
  // Get a collection of handles to all h1,h2, and h3 nodes
  let titles = await b.findElements(By.css("h1,h2,h3"));

  for (let el of titles) {
    // Fetch the text content from each
    // Equiv of el.textContent.trim()
    console.log(await el.text());
  }
});
```

## Methods

### `blur()`

Clears focus from this element so that it will no longer receive keyboard inputs.

**Parameters**

- returns: [`Promise<void>`][promise]

### `clear()`

Schedules a command to clear the value of this element.
This command has no effect if the underlying DOM element is neither a text
INPUT, SELECT, or a TEXTAREA element.

**Parameters**

- returns: [`Promise<void>`][promise]

### `click([, options])`

Sends a click event to the element attached to this handle. If the element is
currently outside the viewport it will first scroll to that element.

**Parameters**

- options? [`ClickOptions`][clickoptions] (Optional)
- returns: [`Promise<void>`][promise]

### `dispose()`

**Parameters**

- returns: [`Promise<void>`][promise]

### `findElement(locator)`

Locates an element using the supplied [Locator][], returning an [ElementHandle][].

**Parameters**

- locator `string` | [`Locator`][locator]
- returns: [Promise<[`ElementHandle`][ElementHandle] | `null>`][promise]

### `findElements(locator)`

Locates all elements using the supplied [Locator][], returning an array of [ElementHandles][elementhandle].

**Parameters**

- locator [`Locator`][locator] | `string`
- returns: [Promise<[`ElementHandle`][ElementHandle][]>][promise]

### `focus()`

Sends focus to this element so that it receives keyboard inputs.

**Parameters**

- returns: [`Promise<void>`][promise]

### `getAttribute(key)`

Fetches the value of an attribute on this element

**Parameters**

- key `string`
- returns: [`Promise<string | null>`][promise]

### `getId()`

Fetches the remote elements `id` attribute.

**Parameters**

- returns: [`Promise<string | null>`][promise]

### `getProperty(key)`

getProperty

**Parameters**

- key `string`
- returns: [`Promise<string | null>`][promise]

### `highlight()`

**Parameters**

- returns: [`Promise<void>`][promise]

### `isDisplayed()`

Checks whether the remote element is displayed in the DOM and is visible to the user without being hidden by CSS or occluded by another element.

**Parameters**

- returns: [`Promise<boolean>`][promise]

### `isEnabled()`

Checks whether the remote element is enabled. Typically this means it does not have a `disabled` property or attribute applied.

**Parameters**

- returns: [`Promise<boolean>`][promise]

### `isSelectable()`

Checks whether the remote element is selectable. An element is selectable if it is an `<option>` or `input[type="checkbox"]` or radio button.

**Parameters**

- returns: [`Promise<boolean>`][promise]

### `isSelected()`

If the remote element is selectable (such as an `<option>` or `input[type="checkbox"]`) this methos will indicate whether it is selected.

**Parameters**

- returns: [`Promise<boolean>`][promise]

### `location()`

Fetches the remote elements physical location as `x` and `y`.

**Parameters**

- returns: [`Promise<Location>`][promise]

### `sendKeys(...keys)`

Sends a series of key modifiers to the element.

**Parameters**

- keys `string`[]
- returns: [`Promise<void>`][promise]

### `size()`

Fetches the remote elements physical dimensions as `width` and `height`.

**Parameters**

- returns: [`Promise<Size>`][promise]

### `tagName()`

Fetches the remote elements `tagName` property.

**Parameters**

- returns: [`Promise<string | null>`][promise]

### `takeScreenshot([, options])`

Takes a screenshot of this element and saves it to the results folder with a random name.

**Parameters**

- options? [`ScreenshotOptions`][screenshotoptions] (Optional)
- returns: [`Promise<void>`][promise]

### `text()`

Retrieves the text content of this element excluding leading and trailing whitespace.

**Parameters**

- returns: [`Promise<string>`][promise]

### `type(text)`

Sends a series of key presses to the element to simulate a user typing on the keyboard. Use this to fill in input fields.

**Parameters**

- text `string`
- returns: [`Promise<void>`][promise]

### `uploadFile(filepath)`
Sets the value of the file input. The name of a file you uploaded with this script. Relative to the script.

**Parameters**
- filepath `string` relative path to the file to be uploaded, separated by comma in case there're more than 1 file
- returns: [`Promise<void>`][promise]

[promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
[clickoptions]: mouse.md#clickoptions
[locator]: Locators
[elementhandle]: ElementHandle
[screenshotoptions]: browser.md#screenshotoptions
