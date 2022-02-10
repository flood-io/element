---
title: ''
---

# `Browser`

Browser (also called Driver) is the main entry point in each <[step]>, it's your direct connection to the browser running the test.

```typescript
import { step } from '@flood/element'
export default () => {
	step('Start', async (browser) => {
		await browser.visit('https://challenge.flood.io')
	})
}
```

#### methods

#### `Browser.authenticate([, username, password])`

- `username` &lt;undefined | string&gt; (Optional)
- `password` &lt;undefined | string&gt; (Optional)
- returns: &lt;[Promise]&lt;void&gt;&gt;

Sets the HTTP Authentication details to use if the page is presented with an authentication prompt.

Call without any args to disable authentication.

#### `Browser.blur(locator)`

- `locator` &lt;[NullableLocatable]&gt;
- returns: &lt;[Promise]&lt;void&gt;&gt;

Removes focus from the specified DOM element.

#### `Browser.clear(locatable)`

- `locatable` &lt;[NullableLocatable]&gt;
- returns: &lt;[Promise]&lt;void&gt;&gt;

Clears the selected value of an input or select control.

#### `Browser.clearBrowserCache()`

- returns: &lt;[Promise]&lt;any&gt;&gt;

Clear browser cache.

#### `Browser.clearBrowserCookies()`

- returns: &lt;[Promise]&lt;any&gt;&gt;

Clear browser cookies.

#### `Browser.click(locatable[, options])`

- `locatable` &lt;[NullableLocatable]&gt;
- `options` &lt;[ClickOptions]&gt; (Optional)
- returns: &lt;[Promise]&lt;void&gt;&gt;

Sends a click event to the element located at `selector`. If the element is
currently outside the viewport it will first scroll to that element.

**Example:**

```typescript
step('Start', async (browser) => {
	await browser.click(By.partialLinkText('Start'))
})
```

In this example we're constructing a <[Locatable]> using the `By.partialLinkText()` Locator, which will match the first `<a>` tag which contains the text "Start".

#### `Browser.doubleClick(locatable[, options])`

- `locatable` &lt;[NullableLocatable]&gt;
- `options` &lt;[ClickOptions]&gt; (Optional)
- returns: &lt;[Promise]&lt;void&gt;&gt;

Sends a double-click event to the element located by the supplied Locator or `selector`. If the element is
currently outside the viewport it will first scroll to that element.

#### `Browser.emulateDevice(deviceName)`

- `deviceName` &lt;[Device]&gt;
- returns: &lt;[Promise]&lt;void&gt;&gt;

Configure Browser to emulate a given device

#### `Browser.evaluate(fn, args)`

- `fn` &lt;[EvaluateFn]&gt;
- `args` &lt;any\[]&gt;
- returns: &lt;[Promise]&lt;any&gt;&gt;

#### `Browser.findElement(locator)`

- `locator` &lt;[NullableLocatable]&gt;
- returns: &lt;[Promise]&lt;[ElementHandle]&gt;&gt;

Uses the provided locator to find the first element it matches, returning an ElementHandle.
If no element is found throws an error.

#### `Browser.findElements(locator)`

- `locator` &lt;[NullableLocatable]&gt;
- returns: &lt;[Promise]&lt;[ElementHandle]\[]&gt;&gt;

Uses the provided locator to find all elements matching the locator condition, returning an array of ElementHandles

#### `Browser.focus(locator)`

- `locator` &lt;[NullableLocatable]&gt; The <[Locator]> to use to find an element to send focus to.
- returns: &lt;[Promise]&lt;void&gt;&gt;

Makes the element located by the first argument the receiver of future input.

#### `Browser.highlightElement(element)`

- `element` &lt;[ElementHandle]&gt;
- returns: &lt;[Promise]&lt;void&gt;&gt;

Highlight an element. Useful in concert with takeScreenshot to tweak your locators.

#### `Browser.maybeFindElement(locator)`

- `locator` &lt;[NullableLocatable]&gt;
- returns: &lt;[Promise]&lt;[ElementHandle] | null&gt;&gt;

Uses the provided locator to find the first element it matches, returning an ElementHandle.

#### `Browser.press(keyCode[, options])`

- `keyCode` &lt;string&gt;
- `options` &lt;undefined | {"text":"undefined | string","delay":"undefined | number"}&gt; (Optional)
- returns: &lt;[Promise]&lt;void&gt;&gt;

Presses a key on the keyboard specified by key code. For example, <[Key.ALT]>

#### `Browser.selectByIndex(locatable, index)`

- `locatable` &lt;[NullableLocatable]&gt;
- `index` &lt;string&gt;
- returns: &lt;[Promise]&lt;string\[]&gt;&gt;

Selects an option within a `<select>` tag by its index in the list.

#### `Browser.selectByText(locatable, text)`

- `locatable` &lt;[NullableLocatable]&gt;
- `text` &lt;string&gt;
- returns: &lt;[Promise]&lt;string\[]&gt;&gt;

Selects an option within a `<select>` tag by matching its visible text.

#### `Browser.selectByValue(locatable, values)`

- `locatable` &lt;[NullableLocatable]&gt;
- `values` &lt;string\[]&gt;
- returns: &lt;[Promise]&lt;string\[]&gt;&gt;

Selects an option within a `<select>` tag using the value of the `<option>` element.

#### `Browser.sendKeys(keys)`

- `keys` &lt;string\[]&gt;
- returns: &lt;[Promise]&lt;void&gt;&gt;

`sendKeys` simulates typing a list of strings on the keyboard.

If a string is a member of <[Key]> it is pressed individually. Otherwise the string is typed.
This allows sendKeys to simulate a user typing control keys such as `Key.ENTER`.

**Example:**

```typescript
await browser.click('#input_address')
await browser.sendKeys('Hello, World!', Key.ENTER)
```

#### `Browser.setExtraHTTPHeaders(headers)`

- `headers` &lt;unknown reflection type&gt;
- returns: &lt;[Promise]&lt;void&gt;&gt;

#### `Browser.setUserAgent(userAgent)`

- `userAgent` &lt;string&gt;
- returns: &lt;[Promise]&lt;void&gt;&gt;

Set Browser to send a custom User Agent (UA) string

#### `Browser.switchTo()`

- returns: &lt;[TargetLocator]&gt;

Switch the focus of the browser to another frame, tab, or window.

#### `Browser.takeScreenshot([, options])`

- `options` &lt;[ScreenshotOptions]&gt; (Optional)
- returns: &lt;[Promise]&lt;void&gt;&gt;

Takes a screenshot of the whole page and saves it to the `flood/results` folder with a random sequential name. You can download the archive of your test results at the end of the test to retrieve these screenshots.

#### `Browser.title()`

- returns: &lt;[Promise]&lt;string&gt;&gt;

#### `Browser.type(locatable, text[, options])`

- `locatable` &lt;[NullableLocatable]&gt;
- `text` &lt;string&gt;
- `options` &lt;undefined | {"delay":"number"}&gt; (Optional)
- returns: &lt;[Promise]&lt;void&gt;&gt;

Types a string into an `<input>` control, key press by key press. Use this to fill inputs as though it was typed by the user.

**Example:**

```typescript
step('Step 1', async (browser) => {
	await browser.type(By.css('#email'), 'user@example.com')
})
```

#### `Browser.visit(url[, options])`

- `url` &lt;string&gt; url to visit
- `options` &lt;[NavigationOptions]&gt; (Optional) puppeteer navigation options

- returns: &lt;[Promise]&lt;void&gt;&gt;

Instructs the browser to navigate to a specific page. This is typically used as the
entrypoint to your test, as the first instruction it is also responsible for creating
a new Browser tab for this page to load into.

**Example:**

```typescript
step('Start', async (browser) => {
	await browser.visit('https://example.com')
})
```

#### `Browser.wait(timeoutOrCondition)`

- `timeoutOrCondition` &lt;[Condition] | number&gt;
- returns: &lt;[Promise]&lt;boolean&gt;&gt;

Creates a waiter which will pause the test until a condition is met or a timeout is reached. This can be used for validation or control flow.

Check out <[Until]> for a rich set of wait <[Condition]>s.

**Example:**

```typescript
step('Start', async (browser) => {
	await browser.wait(Until.elementIsVisible(By.css('h1.title')))
})
```

You can use either a numeric value in seconds to wait for a specific time,
or a <[Condition]>, for more flexible conditions.

#### `Browser.waitForNavigation()`

- returns: &lt;[Promise]&lt;any&gt;&gt;

#### properties

- `frames` &lt;[Frame]\[]&gt; The list of puppeteer Frames
- `mouse` &lt;[Mouse]&gt; The Mouse class operates in main-frame CSS pixels relative to the top-left corner of the viewport.  
  Every page has its own <[Mouse]>, accessible with `browser.mouse`.
- `page` &lt;[Page]&gt; The current puppeteer Page

## `Driver`

Driver is an alias to Browser. Please use Browser when possible.

## `Locatable`

Locatable represents anything able to be located, either a string selector or a <[Locator]>. <[Locator]>s are generally created using <[By]> methods.

```typescript
;[Locator] | [ElementHandle] | string
```

## `NullableLocatable`

NullableLocatable represents a <[Locatable]> which could also be null.

Note that most Element location API methods accept a NullableLocatable but will throw an <[Error]> if its actually <[null]>.

```typescript
;[Locatable] | null
```

# `BoundingBox`

#### properties

- `height` &lt;number&gt; The height.
- `width` &lt;number&gt; The width.
- `x` &lt;number&gt; The x-coordinate of top-left corner.
- `y` &lt;number&gt; The y-coordinate of top-left corner.

# `ClickOptions`

#### properties

- `button` &lt;[MouseButtons]&gt; (Optional)
- `clickCount` &lt;undefined | number&gt; (Optional)
- `delay` &lt;undefined | number&gt; (Optional) Time to wait between mousedown and mouseup in milliseconds.

# `NavigationOptions`

The navigation options.

#### properties

- `timeout` &lt;undefined | number&gt; (Optional) Maximum navigation time in milliseconds, pass 0 to disable timeout.
- `waitUntil` &lt;[LoadEvent] | [LoadEvent]\[]&gt; (Optional) When to consider navigation succeeded.

# `ScreenshotOptions`

Defines the screenshot options.

#### properties

- `clip` &lt;[BoundingBox]&gt; (Optional) An object which specifies clipping region of the page.
- `encoding` &lt;"base64" | "binary"&gt; (Optional) The encoding of the image, can be either base64 or binary.
- `fullPage` &lt;undefined | false | true&gt; (Optional) When true, takes a screenshot of the full scrollable page.
- `omitBackground` &lt;undefined | false | true&gt; (Optional) Hides default white background and allows capturing screenshots with transparency.
- `path` &lt;undefined | string&gt; (Optional) The file path to save the image to. The screenshot type will be inferred from file extension.  
  If `path` is a relative path, then it is resolved relative to current working directory.  
  If no path is provided, the image won't be saved to the disk.
- `quality` &lt;undefined | number&gt; (Optional) The quality of the image, between 0-100. Not applicable to png images.
- `type` &lt;"jpeg" | "png"&gt; (Optional) The screenshot type.

## `LoadEvent`

```typescript
;'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2'
```

[step]: ../../api/DSL.md#step
[promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
[nullablelocatable]: ../../api/Browser.md#nullablelocatable
[clickoptions]: ../../api/Browser.md#clickoptions
[locatable]: ../../api/Browser.md#locatable
[device]: ../../api/Constants.md#device
[evaluatefn]: ../..#evaluatefn
[elementhandle]: ../../api/ElementHandle.md#elementhandle
[locator]: ../../api/By.md#locator
[key]: ../../api/Constants.md#key
[targetlocator]: ../../api/TargetLocator.md#targetlocator
[screenshotoptions]: ../../api/Browser.md#screenshotoptions
[navigationoptions]: ../../api/Browser.md#navigationoptions
[condition]: ../../api/Until.md#condition
[until]: ../../api/Until.md#until
[mouse]: ../../api/Mouse.md#mouse
[by]: ../../api/By.md#by
[error]: https://nodejs.org/api/errors.html#errors_class_error
[null]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/null
[mousebuttons]: ../..#mousebuttons
[loadevent]: ../../api/Browser.md#loadevent
[boundingbox]: ../../api/Browser.md#boundingbox
