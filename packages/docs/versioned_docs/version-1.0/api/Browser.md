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
import { step } from "@flood/element";
export default () => {
  step("Start", async (browser) => {
    await browser.visit("https://challenge.flood.io");
  });
};
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

### `clearBrowserCookies()`

Clear browser cookies.

**Parameters**

- returns: [Promise<`any`>][promise]

### `click(locatable[, options])`

Sends a click event to the element located at `selector`. If the element is
currently outside the viewport it will first scroll to that element.

**Example:**

```ts title="my-test.perf.ts"
step("Start", async (browser) => {
  await browser.click(By.partialLinkText("Start"));
});
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

### `emulateDevice(deviceName)`

Configure Browser to emulate a given device

**Parameters**

- deviceName [`Device`][device]
- returns: [Promise<`void`>][promise]

### `evaluate(fn, ...args)`

**Parameters**

- fn [`EvaluateFn`][evaluatefn]
- args `any`\[]
- returns: [Promise<`any`>][promise]

### `findElement(locator)`

Uses the provided locator to find the first element it matches, returning an ElementHandle.
If no element is found throws an error.

**Parameters**

- locator [`NullableLocatable`][nullablelocatable]
- returns: [Promise&lt;[`ElementHan<][ElementHandle]>][promise]

### `findElements(locator)`

Uses the provided locator to find all elements matching the locator condition, returning an array of ElementHandles

**Parameters**

- locator [`NullableLocatable`][nullablelocatable]
- returns: [Promise&lt;[`ElementHan<][ElementHandle]\[\]>][promise]

### `focus(locator)`

Makes the element located by the first argument the receiver of future input.

**Parameters**

- locator [`NullableLocatable`][nullablelocatable] The [Locator][] to use to find an element to send focus to.
- returns: [Promise<`void`>][promise]

### `highlightElement(element)`

Highlight an element. Useful in concert with takeScreenshot to tweak your locators.

**Parameters**

- element [`ElementHandle`][elementhandle]
- returns: [Promise<`void`>][promise]

### `maybeFindElement(locator)`

Uses the provided locator to find the first element it matches, returning an ElementHandle.

**Parameters**

- locator [`NullableLocatable`][nullablelocatable]
- returns: [Promise&lt;[`ElementHandle`][ElementHandle] <null`>][promise]

### `press(keyCode[, options])`

Presses a key on the keyboard specified by key code. For example, [Key.ALT][key.alt]

**Parameters**

- keyCode `string`
- options? (Optional)
- returns: [Promise<`void`>][promise]

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
await browser.click("#input_address");
await browser.sendKeys("Hello, World!", Key.ENTER);
```

**Parameters**

- keys `string`\[]
- returns: [Promise<`void`>][promise]


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
step("Step 1", async (browser) => {
  await browser.type(By.css("#email"), "user@example.com");
});
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
step("Start", async (browser) => {
  await browser.visit("https://example.com");
});
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
step("Start", async (browser) => {
  await browser.wait(Until.elementIsVisible(By.css("h1.title")));
});
```

You can use either a numeric value in seconds to wait for a specific time,
or a [Condition][], for more flexible conditions.

**Parameters**

- timeoutOrCondition [`Condition`][condition] \| `number`
- returns: [Promise<`boolean`>][promise]

### `waitForNavigation()`

**Parameters**

- returns: [Promise<`any`>][promise]

## `Locatable`
Locatable represents anything able to be located, either a string selector or a <[Locator]>. <[Locator]>s are generally created using <[By]> methods.

```typescript
[Locator] | [ElementHandle] | string
```
## `NullableLocatable`
NullableLocatable represents a <[Locatable]> which could also be null.

Note that most Element location API methods accept a NullableLocatable but will throw an <[Error]> if its actually <[null]>.

```typescript
[Locatable] | null
```

[step]: ../guides/script
[promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
[nullablelocatable]: Locators
[locatable]: Locators
[clickoptions]: Puppeteer
[device]: Constants
[elementhandle]: ElementHandle
[locator]: Locators
[key]: Constants#key
[keys]: Constants#key
[targetlocator]: TargetLocator
[screenshotoptions]: Puppeteer
[navigationoptions]: Puppeteer
[until]: Waiters
[condition]: Waiters
[condition]: Waiters
[by]: Locators
[error]: https://nodejs.org/api/errors.html#errors_class_error
[null]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/null
