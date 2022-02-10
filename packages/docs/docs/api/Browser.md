---
id: browser
title: Browser
hide_title: true
---

# `Browser`

`Browser` is the main entry point in each [step][], it's your direct connection to the browser running the test.

If you're coming from Selenium, the `browser` is synonymous with the Driver interface in Selenium.

If you're coming from Puppeteer, think of the Browser as a wrapper around the Puppeteer Page object.

You don't need to create a browser instance because it is passed into each step for your, and reset after each test loop.

```ts title="my-test.perf.ts"
import { step } from '@flood/element'
export default () => {
	step('Start', async (browser) => {
		await browser.visit('https://challenge.flood.io')
	})
}
```

## Methods

### `authenticate([, username, password])`

Sets the HTTP Authentication details to use if the page is presented with an authentication prompt.

Call without any args to disable authentication.

**Parameters**

- `username`? `string` (Optional)
- `password`? `string` (Optional)
- returns: [`Promise<void>`][promise]

### `blur(locator)`

Removes focus from the specified DOM element.

**Parameters**

- locator [`NullableLocatable`][nullablelocatable]
- returns: [Promise<`void`>][promise]

### `clear(locatable)`

Clears the selected value of an input or select control.

**Parameters**

- locatable [`NullableLocatable`][nullablelocatable]
- returns: [Promise<`void`>][promise]

### `clearBrowserCache()`

Clear browser cache.

**Parameters**

- returns: [Promise<`any`>][promise]

**Note:**
This is only applicable for chromium-based browsers. Firefox and Webkit are not supported.

### `clearBrowserCookies()`

Clear browser cookies.

**Parameters**

- returns: [Promise<`any`>][promise]

### `click(locatable[, options])`

Sends a click event to the element located at `selector`. If the element is
currently outside the viewport it will first scroll to that element.

**Example:**

```ts title="my-test.perf.ts"
step('Start', async (browser) => {
	await browser.click(By.partialLinkText('Start'))
})
```

In this example we're constructing a [Locatable][] using the `By.partialLinkText()` Locator, which will match the first `<a>` tag which contains the text "Start".

**Parameters**

- locatable [`NullableLocatable`][nullablelocatable]
- options? [`ClickOptions`][clickoptions] (Optional)
- returns: [Promise<`void`>][promise]

### `doubleClick(locatable[, options])`

Sends a double-click event to the element located by the supplied Locator or `selector`. If the element is
currently outside the viewport it will first scroll to that element.

**Parameters**

- locatable [`NullableLocatable`][nullablelocatable]
- options? [`ClickOptions`][clickoptions] (Optional)
- returns: [Promise<`void`>][promise]

### `drag(sourceElement, targetElement)`

Drags the source element to the target element

**Parameters**

- sourceElement [`ElementHandle`][elementhandle]
- targetElement [`ElementHandle`][elementhandle]
- returns: [Promise<`void`>][promise]

### `emulateDevice(deviceName)`

Configure Browser to emulate a given device

**Parameters**

- deviceName [`Device`][device]
- returns: [Promise<`void`>][promise]

### `evaluate(fn, ...args)`

**Parameters**

- fn <function|string> Function to be evaluated in the page context
- args `any`\[]
- returns: [Promise<`any`>][promise]

### `findElement(locator)`

Uses the provided locator to find the first element it matches, returning an ElementHandle.
If no element is found throws an error.

**Parameters**

- locator [`NullableLocatable`][nullablelocatable]
- returns: [Promise&lt;ElementHandle&gt;][promise]

### `findElements(locator)`

Uses the provided locator to find all elements matching the locator condition, returning an array of ElementHandles

**Parameters**

- locator [`NullableLocatable`][nullablelocatable]
- returns: [Promise&lt;ElementHandle&gt;][promise]

### `focus(locator)`

Makes the element located by the first argument the receiver of future input.

**Parameters**

- locator [`NullableLocatable`][nullablelocatable] The [Locator][] to use to find an element to send focus to.
- returns: [Promise<`void`>][promise]

### `getCookies([filterBy])`

Gets cookies by URL(s) and/or by cookie name(s). If no URLs and cookie names are specified, this method returns all cookies. If URLs and/or cookie names are specified, only cookies that affect those URLs and/or match those names are returned.

**Parameters**

- filterBy? `FilterBy` (Optional)
  - url? `string | string[] | undefined` List of URLs (Optional)
  - name? `string | string[] | undefined` List of cookie names (Optional)
- returns: [Promise<Cookie[]>][promise]
  - name `string`
  - value `string`
  - domain `string`
  - path `string`
  - expires `number` Unix time in seconds.
  - httpOnly `boolean`
  - secure `boolean`
  - sameSite `"Strict"|"Lax"|"None"`

:::info Note

- If you pass `https` URL(s) to the method, only cookies that have `secure: true` will be returned.
- If you pass `http` URL(s) to the method, only cookies that have `secure: false` will be returned.
  :::

**Example:**

```ts title="my-test.perf.ts"
step('Start', async (browser) => {
	await browser.visit('https://challenge.flood.io')
	const cookies = await browser.getCookies({ names: 'largest_order' })
	for (const cookie of cookies) {
		console.log(JSON.stringify(cookie))
	}
})
```

### `getMimeType(filePath)`

Returns the Media (MIME) Type of a file

**Parameters**

- filePath `string` path to a file
- returns: `string` media type of the file

### `getUrl()`

Returns the URL of the current page

**Parameters**

- returns: `string` URL of the current page

### `highlightElement(element)`

Highlight an element. Useful in concert with takeScreenshot to tweak your locators.

**Parameters**

- element [`ElementHandle`][elementhandle]
- returns: [Promise<`void`>][promise]

### `maybeFindElement(locator)`

Uses the provided locator to find the first element it matches, returning an ElementHandle.

**Parameters**

- locator [`NullableLocatable`][nullablelocatable]
- returns: [Promise&lt;Element | null&gt;][promise]

### `press(keyCode[, options])`

Presses a key on the keyboard specified by key code. For example, [Key.ALT][key.alt]

**Parameters**

- keyCode `string`
- options? (Optional)
- returns: [Promise<`void`>][promise]

### `scrollBy(x, y[, options])`

Scroll the document by the given number of pixels.

**Parameters**

- x `number` How many pixels to scroll by, along the x-axis (horizontal). Positive values will scroll to the right, while negative values will scroll to the left.

- y `number` How many pixels to scroll by, along the y-axis (vertical). Positive values will scroll down, while negative values scroll up.

- x and y can take `'window.innerHeight'` and `'window.innerWidth'` as special values

- options is an object containing [ScrollOptions](#scrolloptions).

### `scrollTo(position[, options])`

Scroll the document to the specified position.

**Parameters**

- position can be any of these types:

  - [`ElementHandle`](ElementHandle)
  - [`Locator`](Locators)
  - `Point`: an array of `x`(number) and `y`(number) co-ordinate
  - `String`: 'top', 'bottom', 'left' or 'right'

- options is an object containing [ScrollOptions](#scrolloptions).

### `selectByIndex(locatable, index)`

Selects an option within a `<select>` tag by its index in the list.

**Parameters**

- locatable [`NullableLocatable`][nullablelocatable]
- index `string`
- returns: [Promise<`string`\[\]>][promise]

### `selectByText(locatable, text)`

Selects an option within a `<select>` tag by matching its visible text.

**Parameters**

- locatable [`NullableLocatable`][nullablelocatable]
- text `string`
- returns: [Promise<`string`\[\]>][promise]

### `selectByValue(locatable, ...values)`

Selects an option within a `<select>` tag using the value of the `<option>` element.

**Parameters**

- locatable [`NullableLocatable`][nullablelocatable]
- values `string`\[]
- returns: [Promise<`string`\[\]>][promise]

### `sendKeys(...keys)`

`sendKeys` simulates typing a list of strings on the keyboard.

If a string is a member of [Key][] it is pressed individually. Otherwise the string is typed.
This allows sendKeys to simulate a user typing control keys such as `Key.ENTER`.

**Example:**

```ts title="my-test.perf.ts"
await browser.click('#input_address')
await browser.sendKeys('Hello, World!', Key.ENTER)
```

**Parameters**

- keys `string`\[]
- returns: [Promise<`void`>][promise]

### `sendKeyCombinations(...keys)`

This will simulate the act of pressing a combination of [keys][] on the keyboard at the same time. Use commas to separate individual keys.

:::info SOME COMBINATIONS MAY NOT WORK ON MACOS
On MacOS, some combinations are emulated by the Operating System, instead of the browser. Therefore, you may find some combinations not working as expected, like Command + A (select all), Command + C (copy), Command + V (paste), etc. More information can be found [here](https://github.com/puppeteer/puppeteer/issues/1313)
:::

**Example:**

```ts title="my-test.perf.ts"
await browser.sendKeyCombinations(Key.SHIFT, 'KeyA')
```

### `setUserAgent(userAgent)`

Set Browser to send a custom User Agent (UA) string

**Parameters**

- userAgent `string`
- returns: [Promise<`void`>][promise]

### `switchTo()`

Switch the focus of the browser to another frame, tab, or window.

**Parameters**

- returns: [`TargetLocator`][targetlocator]

### `takeScreenshot([, options])`

Takes a screenshot of the whole page and saves it to the `flood/results` folder with a random sequential name. You can download the archive of your test results at the end of the test to retrieve these screenshots.

**Parameters**

- options? [`ScreenshotOptions`][screenshotoptions] (Optional)
- returns: [Promise<`void`>][promise]

### `title()`

Returns the title of the current page

**Parameters**

- returns: [Promise<`string`>][promise]

### `type(locatable, text[, options])`

Types a string into an `<input>` control, key press by key press. Use this to fill inputs as though it was typed by the user.

**Example:**

```ts title="my-test.perf.ts"
step('Step 1', async (browser) => {
	await browser.type(By.css('#email'), 'user@example.com')
})
```

**Parameters**

- locatable [`NullableLocatable`][nullablelocatable]
- text `string`
- options? (Optional)
- returns: [Promise<`void`>][promise]

### `visit(url[, options])`

Instructs the browser to navigate to a specific page. This is typically used as the
entrypoint to your test, as the first instruction it is also responsible for creating
a new Browser tab for this page to load into.

**Example:**

```ts title="my-test.perf.ts"
step('Start', async (browser) => {
	await browser.visit('https://example.com')
})
```

**Parameters**

- url `string` url to visit
- options? [`NavigationOptions`][navigationoptions] (Optional) puppeteer navigation options
- returns: [Promise<`void`>][promise]

### `wait(timeoutOrCondition)`

Creates a waiter which will pause the test until a condition is met or a timeout is reached. This can be used for validation or control flow.

Check out [Until][] for a rich set of wait [Conditions][condition].

**Example:**

```ts title="my-test.perf.ts"
step('Start', async (browser) => {
	await browser.wait(Until.elementIsVisible(By.css('h1.title')))
})
```

You can use either a numeric value in seconds to wait for a specific time,
or a [Condition][], for more flexible conditions.

**Parameters**

- timeoutOrCondition [`Condition`][condition] \| `number`
- returns: [Promise<`boolean`>][promise]

### `waitForNavigation()`

**Parameters**

- returns: [Promise<`any`>][promise]

# `Locatable`

Locatable represents anything able to be located, either a string selector or a <[Locator]>. <[Locator]>s are generally created using <[By]> methods.

```typescript
;[Locator] | [ElementHandle] | string
```

# `NullableLocatable`

NullableLocatable represents a <[Locatable]> which could also be null.

Note that most Element location API methods accept a NullableLocatable but will throw an <[Error]> if its actually <[null]>.

```typescript
;[Locatable] | null
```

# `NavigationOptions`

An object which might have the following properties

**Properties**

- `timeout` &lt;number&gt; (Optional) Maximum navigation time in milliseconds, defaults to 30 seconds, pass 0 to disable timeout.
- `waitUntil` &lt;string | array&gt; (Optional) When to consider navigation succeeded, defaults to load. Given an array of event strings, navigation is considered to be successful after all events have been fired. Events can be either:
  - `"load"` - consider navigation to be finished when the load event is fired.
  - `"domcontentloaded"` - consider navigation to be finished when the DOMContentLoaded event is fired.
  - `"networkidle0"` - consider navigation to be finished when there are no more than 0 network connections for at least 500 ms.
  - `"networkidle2"` - consider navigation to be finished when there are no more than 2 network connections for at least 500 ms.

# `ScreenshotOptions`

Defines the screenshot options.

**Properties**

- `clip` &lt;Object&gt; (Optional) An object which specifies clipping region of the page. Should have the following fields:
  - `x` &lt;number&gt; The x-coordinate of top-left corner of clipping area.
  - `y` &lt;number&gt; The y-coordinate of top-left corner of clipping area.
  - `height` &lt;number&gt; The height of clipping area.
  - `width` &lt;number&gt; The width of clipping area.
- `encoding` &lt;string&gt; (Optional) The encoding of the image, can be either `"base64"` or `"binary"`. Defaults to `binary`.
- `fullPage` &lt;boolean&gt; (Optional) When true, takes a screenshot of the full scrollable page. Defaults to false.
- `omitBackground` &lt;boolean&gt; (Optional) Hides default white background and allows capturing screenshots with transparency. Defaults to `false`.
- `path` &lt;string&gt; (Optional) The file path to save the image to. The screenshot type will be inferred from file extension.  
  If `path` is a relative path, then it is resolved relative to current working directory.  
  If no path is provided, the image won't be saved to the disk.
- `quality` &lt;number&gt; (Optional) The quality of the image, between 0-100. Not applicable to `png` images.
- `type` &lt;string&gt; (Optional) Specify screenshot type, can be either `"jpeg"` or `"png"`. Defaults to `png`.

# ScrollOptions

Is an Object with the following properties:

- `behaviour`: Defines the transition animation. One of `'auto'` (default) or `'smooth'`.
- `block`: Defines vertical alignment. One of `'start'` (default), `'center'`, `'end'`, or `'nearest'`.
- `inline`: Defines horizental alignment. One of `'start'`, `'center'`, `'end'`, or `'nearest'` (default).

**Note:**

1. If you use `behaviour: 'smooth'`, it may take the browser some time to scroll. Therefore, consider adding a wait after the scroll action to avoid unexpected error.
2. `block` and `inline` only work with `browser.scrollTo()`, with [`ElementHandle`](ElementHandle) or [`Locator`](Locators) as the 1st parameter.

[step]: ../guides/script
[promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
[nullablelocatable]: #nullablelocatable
[locatable]: #locatable
[clickoptions]: mouse#clickoptions
[device]: Constants
[elementhandle]: ElementHandle
[locator]: Locators
[key]: Constants#key
[keys]: Constants#key
[targetlocator]: TargetLocator
[screenshotoptions]: #screenshotoptions
[navigationoptions]: #navigationoptions
[until]: Waiters
[condition]: Waiters#condition
[by]: Locators
[error]: https://nodejs.org/api/errors.html#errors_class_error
[null]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/null
