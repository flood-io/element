---
title: Test Settings
id: settings
hide_title: true
---

# `TestSettings`

The `TestSettings` is used to configure how you want Element to behave during a test run, including wait timing, timeouts, browser agent, window size, and much more.

Settings are specified by exporting a `const settings` from your test script, and loaded when your test script is first evaluated by the test runner.

**Example:**

```typescript title="my-test.perf.ts"
import { TestSettings } from "@flood/element";

export const settings: TestSettings = {
  loopCount: Infinity,
  clearCache: true,
  waitUntil: "visible",
};
```

See [DEFAULT_SETTINGS] for a list of the default value for each setting.

**Properties**

- `DOMSnapshotOnFailure`? `false` \| `true` (Optional) Take a DOM snapshot of the page when a command fails, to aid in debugging.
- `actionDelay`? `number` (Optional) Specifies the time (in seconds) to wait between each action call.Waiting between actions simulates the behaviour of a real user as they read, think and act on the page's content.
- `chromeVersion`? [`ChromeVersion`][chromeversion] (Optional)
- `clearCache`? `false` \| `true` (Optional) Specifies whether Brwoser cache should be cleared after each test loop.
- `clearCookies`? `false` \| `true` (Optional) Specifies whether cookies should be cleared after each test loop.
- `consoleFilter`? [`ConsoleMethod`][consolemethod]\[] (Optional) Specify which console methods to filter out. By default no console methods are filtered.This setting can be useful for very noisy tests. When a method is filtered, it still works as normal but the message will be omitted from the Element output.
- `description`? `string` (Optional) Speicifies the description of the test specified in the comments section
- `device`? `string` (Optional) Specifies a device to emulate with browser device emulation.
- `disableCache`? `false` \| `true` (Optional) Disables browser request cache for all requests.
- `duration`? `number` (Optional) Maximum duration to run the test for.Note that when running a load test via <https://flood.io>, the duration of the load test takes precedence over this setting.Defaults to `-1` for no timeout.
- `ignoreHTTPSErrors`? `false` \| `true` (Optional) Whether to ignore HTTPS errors during navigation. Defaults to `false`
- `loopCount`? `number` (Optional) Number of times to run this test.Defaults to `-1` for an unlimited number of loops.
- `name`? `string` (Optional) Speicifies the name of the test specified in the comments section
- `responseTimeMeasurement`? [`ResponseTiming`][responsetiming] (Optional) Configures how we record response time for each step.Possible values:- `"page"`: Record the document loading response time. This is usually what you consider response time on paged web apps.
  - `"network"`: Takes the mean response time of all network requests which occur during a step. This is useful for Single Page Application which don't actually trigger a navigation.
  - `"step"`: (Default) Records the wall clock time of a step. This is useful for Single Page Application which don't actually trigger a navigation.
  - `"stepWithThinkTime"`: Records the wall clock time of a step including `actionDelay` time.
- `screenshotOnFailure`? `false` \| `true` (Optional) Take a screenshot of the page when a command fails, to aid in debugging.Screenshots are saved to `/flood/result/screenshots` in the test archive.
- `stepDelay`? `number` (Optional) Specifies the time (in seconds) to wait after each step.
- `userAgent`? `string` (Optional) Specifies a custom User Agent (UA) string to send.
- `waitTimeout`? `number` (Optional) Global wait timeout applied to all wait tasks.

### `ConsoleMethod`

Specifies a `console` method

    "log" | "info" | "debug" | "warn" | "error"

### `ResponseTiming`

Specifies a method for recording response times.

| literal           | description                                                                                                                                                                          |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| step              | (Default) Records the wall clock time of a step. This is useful for Single Page Application which don't actually trigger a navigation.                                               |
| page              | Record the document loading response time. This is usually what you consider response time on paged web apps.                                                                        |
| network           | (Experimental) Takes the mean response time of all network requests which occur during a step. This is useful for Single Page Application which don't actually trigger a navigation. |
| stepWithThinkTime | `"stepWithThinkTime"`: Records the wall clock time of a step including `actionDelay` time.                                                                                           |

    "page" | "network" | "step" | "stepWithThinkTime"

### `setup(settings)`

Declares the settings for the test, overriding the settings constant exported in the test script.

_This is a secondary syntax for `export const settings = {}` which functions exactly the same way._

**Example:**

```typescript
export default () => {
  setup({ waitTimeout: 60 });
};
```

**Parameters**

- settings [`TestSettings`][testsettings]
- returns: `void`

### `DEFAULT_SETTINGS`

The default settings for a Test. Any settings you provide are merged into these defaults.

| DEFAULT_SETTINGS          | Default Value                                              | Comment                                                        |
| :------------------------ | :--------------------------------------------------------- | :------------------------------------------------------------- |
| `actionDelay`             | 2                                                          |                                                                |
| `chromeVersion`           | "puppeteer"                                                |                                                                |
| `clearCache`              | false                                                      |                                                                |
| `clearCookies`            | true                                                       |                                                                |
| `consoleFilter`           | \[]                                                        | by default, don't filter any console messages from the browser |
| `device`                  | "Chrome Desktop Large"                                     |                                                                |
| `duration`                | -1                                                         |                                                                |
| `ignoreHTTPSErrors`       | false                                                      |                                                                |
| `loopCount`               | Infinity                                                   |                                                                |
| `responseTimeMeasurement` | "step"                                                     |                                                                |
| `screenshotOnFailure`     | true                                                       |                                                                |
| `stepDelay`               | 6                                                          |                                                                |
| `userAgent`               | CustomDeviceDescriptors\['Chrome Desktop Large'].userAgent |                                                                |
| `waitTimeout`             | 30                                                         |                                                                |

[default_settings]: #default_settings
[consolemethod]: #consolemethod
[responsetiming]: #responsetiming
[testsettings]: settings
