---
title: ''
---
# `TestSettings`

The TestSettings interface specifies the available settings you have to configure how your test runs. These properties should be exported using the property `settings`.

**Example:**

```typescript
export const settings: TestSettings = {
  loopCount: Infinity,
  clearCache: true
}
```

See [DEFAULT_SETTINGS] for a list of the default value for each setting.

#### properties
* `DOMSnapshotOnFailure` &lt;undefined | false | true&gt;  (Optional)   Take a DOM snapshot of the page when a command fails, to aid in debugging.  
* `actionDelay` &lt;undefined | number&gt;  (Optional)   Specifies the time (in seconds) to wait between each action call.  
    
  Waiting between actions simulates the behaviour of a real user as they read, think and act on the page's content.  
    
* `autoWait` &lt;undefined | false | true&gt;  (Optional)   Enable auto waiting before an action. Defaults to `true`  
    
  You can specify a number in seconds to change the default wait time.  
    
* `chromeVersion` &lt;[ChromeVersion]&gt;  (Optional)     
* `clearCache` &lt;undefined | false | true&gt;  (Optional)   Specifies whether Brwoser cache should be cleared after each test loop.  
* `clearCookies` &lt;undefined | false | true&gt;  (Optional)   Specifies whether cookies should be cleared after each test loop.  
* `consoleFilter` &lt;[ConsoleMethod]\[]&gt;  (Optional)   Specify which console methods to filter out. By default no console methods are filtered.  
    
  This setting can be useful for very noisy tests. When a method is filtered, it still works as normal but the message will be omitted from the Element output.  
    
* `description` &lt;undefined | string&gt;  (Optional)   Speicifies the description of the test specified in the comments section  
* `device` &lt;undefined | string&gt;  (Optional)   Specifies a device to emulate with browser device emulation.  
* `disableCache` &lt;undefined | false | true&gt;  (Optional)   Disables browser request cache for all requests.  
* `duration` &lt;undefined | number&gt;  (Optional)   Maximum duration to run the test for.  
    
  Note that when running a load test via https://flood.io, the duration of the load test takes precedence over this setting.  
    
  Defaults to `-1` for no timeout.  
    
* `ignoreHTTPSErrors` &lt;undefined | false | true&gt;  (Optional)   Whether to ignore HTTPS errors during navigation. Defaults to `false`  
* `loopCount` &lt;undefined | number&gt;  (Optional)   Number of times to run this test.  
    
  Defaults to `-1` for an unlimited number of loops.  
    
* `name` &lt;undefined | string&gt;  (Optional)   Speicifies the name of the test specified in the comments section  
* `responseTimeMeasurement` &lt;[ResponseTiming]&gt;  (Optional)   Configures how we record response time for each step.  
    
  Possible values:  
  - `"page"`: Record the document loading response time. This is usually what you consider response time on paged web apps.  
  - `"network"`: Takes the mean response time of all network requests which occur during a step. This is useful for Single Page Application which don't actually trigger a navigation.  
  - `"step"`: (Default) Records the wall clock time of a step. This is useful for Single Page Application which don't actually trigger a navigation.  
  - `"stepWithThinkTime"`: Records the wall clock time of a step including `actionDelay` time.  
    
* `screenshotOnFailure` &lt;undefined | false | true&gt;  (Optional)   Take a screenshot of the page when a command fails, to aid in debugging.  
    
  Screenshots are saved to `/flood/result/screenshots` in the test archive.  
    
* `stepDelay` &lt;undefined | number&gt;  (Optional)   Specifies the time (in seconds) to wait after each step.  
* `userAgent` &lt;undefined | string&gt;  (Optional)   Specifies a custom User Agent (UA) string to send.  
* `waitTimeout` &lt;undefined | number&gt;  (Optional)   Global wait timeout applied to all wait tasks.  
## `ConsoleMethod`
Specifies a `console` method

```typescript
"log" | "info" | "debug" | "warn" | "error"
```
## `ResponseTiming`
Specifies a method for recording response times.

literal | description
--------|------------
step | (Default) Records the wall clock time of a step. This is useful for Single Page Application which don't actually trigger a navigation.
page | Record the document loading response time. This is usually what you consider response time on paged web apps.
network | (Experimental) Takes the mean response time of all network requests which occur during a step. This is useful for Single Page Application which don't actually trigger a navigation.
stepWithThinkTime | `"stepWithThinkTime"`: Records the wall clock time of a step including `actionDelay` time.

```typescript
"page" | "network" | "step" | "stepWithThinkTime"
```
#### `setup(settings)`
* `settings` &lt;[TestSettings]&gt;   

* returns: &lt;void&gt; 

Declares the settings for the test, overriding the settings constant exported in the test script.

_This is a secondary syntax for `export const settings = {}` which functions exactly the same way._

**Example:**

```typescript
export default () => {
 setup({ waitTimeout: 60 })
}
```

# `DEFAULT_SETTINGS`
The default settings for a Test. Any settings you provide are merged into these defaults.

| Name                      | Default Value                                              | Comment                                                        |
| ------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------- |
| `actionDelay`             | 2                                                          |                                                                |
| `autoWait`                | false                                                      |                                                                |
| `chromeVersion`           | "puppeteer"                                                |                                                                |
| `clearCache`              | false                                                      |                                                                |
| `clearCookies`            | true                                                       |                                                                |
| `consoleFilter`           |  []                                                        | by default, don't filter any console messages from the browser |
| `device`                  | "Chrome Desktop Large"                                     |                                                                |
| `duration`                |  -1                                                        |                                                                |
| `ignoreHTTPSErrors`       | false                                                      |                                                                |
| `loopCount`               |  Infinity                                                  |                                                                |
| `responseTimeMeasurement` | "step"                                                     |                                                                |
| `screenshotOnFailure`     | true                                                       |                                                                |
| `stepDelay`               | 6                                                          |                                                                |
| `userAgent`               |  CustomDeviceDescriptors['Chrome Desktop Large'].userAgent |                                                                |
| `waitTimeout`             | 30                                                         |                                                                |

[DEFAULT_SETTINGS]: ../../api/Settings.md#default_settings
[ChromeVersion]: ../..#chromeversion
[ConsoleMethod]: ../../api/Settings.md#consolemethod
[ResponseTiming]: ../../api/Settings.md#responsetiming
[TestSettings]: ../../api/Settings.md#testsettings