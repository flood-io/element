---
id: test-settings
title: 'Test Settings'
---

The `TestSettings` is used to configure how you want Element to behave during a test run, including wait timing, timeouts, browser agent, window size, and much more.

Settings are specified by exporting a `const settings` from your test script, and loaded when your test script is first evaluated by the test runner.

**Example:**

```typescript
export const settings: TestSettings = {
	loopCount: Infinity,
	clearCache: true,
}
```

See [DEFAULT SETTINGS](#default-settings) for a list of the default value for each setting.

## Setting Properties

### actionDelay

`number` (Optional) Specifies the time (in seconds) to wait between each action call.

Waiting between actions simulates the behaviour of a real user as they read, think and act on the page's content.

### blockedDomains

`string\[]` (Optional) Blocks requests to a list a domains. Accepts partial matches using `*` or any matcher accepted by [Micromatch](https://github.com/micromatch/micromatch).

Matching is applied to the `hostname` only, unless the blocked domain contains a `:` in which case it will match against `hostname` and `port`.

Example: `["*.google-analytics.com", "*:1337"]`

### chromeVersion

`puppeteer` or `stable` (Optional) Specifies a version of Google Chrome to run the test

### clearCache

`false` | `true` (Optional) Specifies whether Browser cache should be cleared after each test loop.

### clearCookies

`false` | `true` (Optional) Specifies whether cookies should be cleared after each test loop.

### consoleFilter

[ConsoleMethod](#console-method)(Optional) Specify which console methods to filter out. By default no console methods are filtered.

This setting can be useful for very noisy tests. When a method is filtered, it still works as normal but the message will be omitted from the Element output.

### description

`string` (Optional) Speicifies the description of the test specified in the comments section

### device

`string` (Optional) Specifies a device to emulate with browser device emulation.

### disableCache

`false` | `true` (Optional) Disables browser request cache for all requests.

### duration

`number` (Optional) Maximum duration to run the test for.

Note that when running a load test via [Flood](https://flood.io), the duration of the load test takes precedence over this setting.

Defaults to `-1` for no timeout.

### extraHTTPHeaders

`Object` (Optional) Specifies a set of extra HTTP headers to set before each test loop.  
 If this setting is undefined, the extra HTTP headers are left as-is between iterations.

```typescript
export const settings: TestSettings = {
	extraHTTPHeaders: { 'Accept-Language': 'en' },
}
```

### ignoreHTTPSErrors

`false` | `true` (Optional) Whether to ignore HTTPS errors during navigation. Defaults to `false`

### incognito

`false` | `true` (Optional) Controls whether each iteration should run within an Incognito window instead of a normal  
 window. The Incognito session will be destroyed between each loop.

### launchArgs

`string[]` Additional arguments to pass to the browser instance.
The list of Chromium flags can be found [here](https://peter.sh/experiments/chromium-command-line-switches/)

### loopCount

`number` (Optional) Number of times to run this test.

Defaults to `-1` (or `Infinity`) for an unlimited number of loops.

### name

`string` (Optional) Speicifies the name of the test specified in the comments section

### responseTimeMeasurement

[ResponseTiming](#responsetiming) (Optional) Configures how we record response time for each step.

Possible values:

- `"page"`: Record the document loading response time. This is usually what you consider response time on paged web apps.
- `"network"`: Takes the mean response time of all network requests which occur during a step. This is useful for Single Page Application which don't actually trigger a navigation.
- `"step"`: (Default) Records the wall clock time of a step. This is useful for Single Page Application which don't actually trigger a navigation.
- `"stepWithThinkTime"`: Records the wall clock time of a step including `actionDelay` time.

### screenshotOnFailure

`false` | `true` (Optional) Take a screenshot of the page when a command fails, to aid in debugging.

Screenshots are saved to `/flood/result/screenshots` in the test archive.

### stepDelay

`number` (Optional) Specifies the time (in seconds) to wait after each step.

### userAgent

`string` (Optional) Specifies a custom User Agent (UA) string to send.

### viewport

`Object` Set the viewport with the below properties:

- width `number` page width in pixels. Required.
- height `number` page height in pixels. Required.
- deviceScaleFactor `number` Specify device scale factor (can be thought of as dpr). Defaults to 1.
- isMobile `boolean` Whether the meta viewport tag is taken into account. Defaults to `false`.
- hasTouch `boolean` Specifies if viewport supports touch events. Defaults to `false`.
- isLandscape `boolean` Specifies if viewport is in landscape mode. Defaults to `false`.

### waitTimeout

`number` (Optional) Global wait timeout applied to all wait tasks.

### waitUntil : (Optional)

- present: only checks for presence in the DOM
- visible: waits until the element is visible on the page and is painted
- ready: waits until the element is painted and not disabled

## Console Method

Specifies a `console` method

```typescript
;'log' | 'info' | 'debug' | 'warn' | 'error'
```

## ResponseTiming

Specifies a method for recording response times.

| literal           | description                                                                                                                                                                          |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| step              | (Default) Records the wall clock time of a step. This is useful for Single Page Application which don't actually trigger a navigation.                                               |
| page              | Record the document loading response time. This is usually what you consider response time on paged web apps.                                                                        |
| network           | (Experimental) Takes the mean response time of all network requests which occur during a step. This is useful for Single Page Application which don't actually trigger a navigation. |
| stepWithThinkTime | `"stepWithThinkTime"`: Records the wall clock time of a step including `actionDelay` time.                                                                                           |

```typescript
;'page' | 'network' | 'step' | 'stepWithThinkTime'
```

## setup(settings)

- `settings` &lt;[TestSettings]&gt;

- returns: &lt;void&gt;

Declares the settings for the test, overriding the settings constant exported in the test script.

_This is a secondary syntax for `export const settings = {}` which functions exactly the same way._

**Example:**

```typescript
export default () => {
	setup({ waitTimeout: 60 })
}
```

## DEFAULT SETTINGS

The default settings for a Test. Any settings you provide are merged into these defaults.

| Name                      | Default Value                                             | Comment                                                        |
| ------------------------- | --------------------------------------------------------- | -------------------------------------------------------------- |
| `actionDelay`             | 2                                                         |                                                                |
| `blockedDomains`          | []                                                        |                                                                |
| `chromeVersion`           | "puppeteer"                                               |                                                                |
| `clearCache`              | false                                                     |                                                                |
| `clearCookies`            | true                                                      |                                                                |
| `consoleFilter`           | []                                                        | by default, don't filter any console messages from the browser |
| `description`             | ""                                                        |                                                                |
| `device`                  | "Chrome Desktop Large"                                    |                                                                |
| `disableCache`            | false                                                     |                                                                |
| `duration`                | -1                                                        |                                                                |
| `extraHTTPHeaders`        |                                                           |                                                                |
| `ignoreHTTPSErrors`       | false                                                     |                                                                |
| `incognito`               | false                                                     |                                                                |
| `loopCount`               | Infinity                                                  |                                                                |
| `name`                    | "Element Test"                                            |                                                                |
| `responseTimeMeasurement` | "step"                                                    |                                                                |
| `screenshotOnFailure`     | true                                                      |                                                                |
| `stepDelay`               | 6                                                         |                                                                |
| `userAgent`               | CustomDeviceDescriptors['Chrome Desktop Large'].userAgent |                                                                |
| `waitTimeout`             | 30                                                        |                                                                |
| `waitUntil`               | false                                                     |                                                                |
