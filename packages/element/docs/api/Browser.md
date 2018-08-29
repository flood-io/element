---
title: ''
---
# `Browser`

Browser (also called Driver) is the main entry point in each <[step]>, it's your direct connection to the browser running the test.

```typescript
import { step } from "@flood/element"
export default () => {
  step("Start", async browser => {
    await browser.visit("https://challenge.flood.io")
  })
}
```


#### `browser.authenticate([, username, password])`
* `username` &lt;undefined|string&gt; (Optional) 
* `password` &lt;undefined|string&gt; (Optional) 
* returns: &lt;[Promise]&lt;void&gt;&gt; 

Sets the HTTP Authentication details to use if the page is presented with an authentication prompt.

Call without any args to disable authentication.

#### `browser.blur(locator)`
* `locator` &lt;[NullableLocatable]&gt;  
* returns: &lt;[Promise]&lt;void&gt;&gt; 

Removes focus from the specified DOM element.

#### `browser.clear(locatable)`
* `locatable` &lt;[NullableLocatable]&gt;  
* returns: &lt;[Promise]&lt;void&gt;&gt; 

Clears the selected value of an input or select control.

#### `browser.clearBrowserCache()`
* returns: &lt;[Promise]&lt;any&gt;&gt; 

Clear browser cache.

#### `browser.clearBrowserCookies()`
* returns: &lt;[Promise]&lt;any&gt;&gt; 

Clear browser cookies.

#### `browser.click(locatable[, options])`
* `locatable` &lt;[NullableLocatable]&gt;  
* `options` &lt;[ClickOptions]&gt; (Optional) 
* returns: &lt;[Promise]&lt;void&gt;&gt; 

Sends a click event to the element located at `selector`. If the element is
currently outside the viewport it will first scroll to that element.

**Example:**

```typescript
step("Start", async browser => {
  await browser.click(By.partialLinkText('Start'))
})
```

In this example we're constructing a <[Locatable]> using the `By.partialLinkText()` Locator, which will match the first `<a>` tag which contains the text "Start".


#### `browser.doubleClick(locatable[, options])`
* `locatable` &lt;[NullableLocatable]&gt;  
* `options` &lt;[ClickOptions]&gt; (Optional) 
* returns: &lt;[Promise]&lt;void&gt;&gt; 

Sends a double-click event to the element located by the supplied Locator or `selector`. If the element is
currently outside the viewport it will first scroll to that element.

#### `browser.emulateDevice(deviceName)`
* `deviceName` &lt;[Device]&gt;  
* returns: &lt;[Promise]&lt;void&gt;&gt; 

Configure Browser to emulate a given device

#### `browser.evaluate(fn, args)`
* `fn` &lt;[EvaluateFn]&gt;  
* `args` &lt;any[]&gt;  
* returns: &lt;[Promise]&lt;any&gt;&gt; 

#### `browser.findElement(locator)`
* `locator` &lt;[NullableLocatable]&gt;  
* returns: &lt;[Promise]&lt;[ElementHandle]&gt;&gt; 

Uses the provided locator to find the first element it matches, returning an ElementHandle.
If no element is found throws an error.

#### `browser.findElements(locator)`
* `locator` &lt;[NullableLocatable]&gt;  
* returns: &lt;[Promise]&lt;[ElementHandle][]&gt;&gt; 

Uses the provided locator to find all elements matching the locator condition, returning an array of ElementHandles

#### `browser.focus(locator)`
* `locator` &lt;[NullableLocatable]&gt;  The <[Locator]> to use to find an element to send focus to.
* returns: &lt;[Promise]&lt;void&gt;&gt; 

Makes the element located by the first argument the receiver of future input.

#### `browser.maybeFindElement(locator)`
* `locator` &lt;[NullableLocatable]&gt;  
* returns: &lt;[Promise]&lt;[ElementHandle]|null&gt;&gt; 

Uses the provided locator to find the first element it matches, returning an ElementHandle.

#### `browser.press(keyCode[, options])`
* `keyCode` &lt;string&gt;  
* `options` &lt;undefined|{"text":"undefined|string","delay":"undefined|number"}&gt; (Optional) 
* returns: &lt;[Promise]&lt;void&gt;&gt; 

Presses a key on the keyboard specified by key code. For example, <[Key.ALT]>

#### `browser.selectByIndex(locatable, index)`
* `locatable` &lt;[NullableLocatable]&gt;  
* `index` &lt;string&gt;  
* returns: &lt;[Promise]&lt;string[]&gt;&gt; 

Selects an option within a `<select>` tag by its index in the list.

#### `browser.selectByText(locatable, text)`
* `locatable` &lt;[NullableLocatable]&gt;  
* `text` &lt;string&gt;  
* returns: &lt;[Promise]&lt;string[]&gt;&gt; 

Selects an option within a `<select>` tag by matching its visible text.

#### `browser.selectByValue(locatable, values)`
* `locatable` &lt;[NullableLocatable]&gt;  
* `values` &lt;string[]&gt;  
* returns: &lt;[Promise]&lt;string[]&gt;&gt; 

Selects an option within a `<select>` tag using the value of the `<option>` element.

#### `browser.setUserAgent(userAgent)`
* `userAgent` &lt;string&gt;  
* returns: &lt;[Promise]&lt;void&gt;&gt; 

Set Browser to send a custom User Agent (UA) string

#### `browser.switchTo()`
* returns: &lt;[TargetLocator]&gt; 

Switch the focus of the browser to another frame, tab, or window.

#### `browser.takeScreenshot([, options])`
* `options` &lt;[ScreenshotOptions]&gt; (Optional) 
* returns: &lt;[Promise]&lt;void&gt;&gt; 

Takes a screenshot of the whole page and saves it to the `flood/results` folder with a random sequential name. You can download the archive of your test results at the end of the test to retrieve these screenshots.

#### `browser.type(locatable, text[, options])`
* `locatable` &lt;[NullableLocatable]&gt;  
* `text` &lt;string&gt;  
* `options` &lt;undefined|{"delay":"number"}&gt; (Optional) 
* returns: &lt;[Promise]&lt;void&gt;&gt; 

Types a string into an `<input>` control, key press by key press. Use this to fill inputs as though it was typed by the user.

**Example:**
```typescript
step("Step 1", async browser => {
  await browser.type(By.css("#email"), "user@example.com")
})
```


#### `browser.visit(url[, options])`
* `url` &lt;string&gt;  url to visit
* `options` &lt;[NavigationOptions]&gt; (Optional) puppeteer navigation options

* returns: &lt;[Promise]&lt;void&gt;&gt; 

Instructs the browser to navigate to a specific page. This is typically used as the
entrypoint to your test, as the first instruction it is also responsible for creating
a new Browser tab for this page to load into.

**Example:**

```typescript
step("Start", async browser => {
  await browser.visit("https://example.com")
})
```

#### `browser.wait(timeoutOrCondition)`
* `timeoutOrCondition` &lt;[Condition]|number&gt;  
* returns: &lt;[Promise]&lt;boolean&gt;&gt; 

Creates a waiter which will pause the test until a condition is met or a timeout is reached. This can be used for validation or control flow.

**Example:**

```typescript
step("Start", async browser => {
  await browser.wait(Until.elementIsVisible(By.css('h1.title')))
})
```

You can use either a numeric value in seconds to wait for a specific time,
or a <[Condition]>, for more flexible conditions.

# `Driver`
Driver is an alias to Browser. Please use Browser when possible.

# `Locatable`
Locatable represents anything able to be located, either a string selector or a <[Locator]>. <[Locator]>s are generally created using <[By]> methods.

# `NullableLocatable`
NullableLocatable represents a <[Locatable]> which could also be null.

Note that most Element location API methods accept a NullableLocatable but will throw an <[Error]> if its actually <[null]>.


[step]: ../../api/DSL.md#step
[Promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
[NullableLocatable]: ../../api/Browser.md#nullablelocatable
[Locatable]: ../../api/Browser.md#locatable
[Device]: ../../api/Constants.md#device
[EvaluateFn]: ../..#evaluatefn
[Condition]: ../../api/Until.md#condition
[Locator]: ../../api/By.md#locator
[Error]: https://nodejs.org/api/errors.html#errors_class_error

[step]: ../..#step