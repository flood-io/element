---
title: ''
---
# `TestSettings`

This interface specifies the available options you can use to configure how your test runs. These properties should be exported using the property `settings`.

**Example:**

```typescript
export const settings = {
  loopCount: Infinity,
  clearCache: true
}
```

See [DEFAULT_SETTINGS] for a list of the default value for each setting.

* `DOMSnapshotOnFailure` &lt;undefined|false|true&gt; (Optional)   Take a DOM snapshot of the page when a command fails, to aid in debugging.  
* `actionDelay` &lt;undefined|number&gt; (Optional)   Specifies the time (in seconds) to wait between each action call, to simulate a normal user  
  thinking about what to do next.  
* `clearCache` &lt;undefined|false|true&gt; (Optional)   Specifies whether Brwoser cache should be cleared after each loop.  
* `clearCookies` &lt;undefined|false|true&gt; (Optional)   Specifies whether cookies should be cleared after each loop.  
* `consoleFilter` &lt;[ConsoleMethod][]&gt; (Optional)   Filters the console output from the target site to log output. Useful for very noisy tests. This won't affect console output from within your script.  
* `description` &lt;undefined|string&gt; (Optional)   Speicifies the description of the test specified in the comments section  
* `device` &lt;undefined|string&gt; (Optional)   Specifies a device to emulate with browser device emulation.  
* `disableCache` &lt;undefined|false|true&gt; (Optional)   Disables browser request cache for all requests.  
* `duration` &lt;undefined|number&gt; (Optional)   Maximum duration to run this for, regardless of other timeouts specified on Flood.  
    
  Defaults to `-1` for no timeout.  
    
* `ignoreHTTPSErrors` &lt;undefined|false|true&gt; (Optional)   Whether to ignore HTTPS errors during navigation. Defaults to `false`  
* `loopCount` &lt;undefined|number&gt; (Optional)   Number of times to run this test.  
  Defaults to `-1` for infinite.  
* `name` &lt;undefined|string&gt; (Optional)   Speicifies the name of the test specified in the comments section  
* `responseTimeMeasurement` &lt;[ResponseTiming]&gt; (Optional)   Configures how we record response time for each step.  
    
  Possible values:  
  - `"page"`: Record the document loading response time. This is usually what you consider response time on paged web apps.  
  - `"network"`: Takes the mean response time of all network requests which occur during a step. This is useful for Single Page Application which don't actually trigger a navigation.  
  - `"step"`: (Default) Records the wall clock time of a step. This is useful for Single Page Application which don't actually trigger a navigation.  
  - `"stepWithThinkTime"`: Records the wall clock time of a step including `actionDelay` time.  
    
* `screenshotOnFailure` &lt;undefined|false|true&gt; (Optional)   Take a screenshot of the page when a command fails, to aid in debugging.  
    
  Screenshots are saved to `/flood/result/screenshots` in the test archive.  
    
* `stepDelay` &lt;undefined|number&gt; (Optional)   Specifies the time (in seconds) to wait after each step.  
* `userAgent` &lt;undefined|string&gt; (Optional)   Specifies a custom User Agent (UA) string to send.  
* `waitTimeout` &lt;undefined|number&gt; (Optional)   Global wait timeout applied to all wait tasks  
#### `setup(settings)`
* `settings` &lt;[TestSettings]&gt;  

* returns: &lt;void&gt; 

Declares the settings for the test, overriding settings exported at the top of the test.

_This is a secondary syntax to `export const settings = {}` which functions exactly the same way.

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
#### `step(name, fn)`
* `name` &lt;string&gt;  Step Name
* `fn` &lt;[StepFunction]&gt;  Actual implementation of step

* returns: &lt;void&gt; 

Declares each step in your test. This must go within your main test expression.

**Example:**

```typescript
export default () => {
  step("Step 1", async browser => {
    await browser.visit("https://example.com")
  })

  step("Step 2", async browser => {})

  step("Step 3", async browser => {})
}
```

#### `step(name, options, fn)`
* `name` &lt;string&gt;  
* `options` &lt;[StepOptions]&gt;  
* `fn` &lt;[StepFunction]&gt;  
* returns: &lt;void&gt; 

`step` can also be called with an overridden subset of Test settings (`options`) valid for just this step.

```typescript
  // Step 1 takes longer than the default `waitTimeout` of 30s.
  step("Step 1", { waitTimeout: 90 }, async browser => {
    ...
  }
```


[DEFAULT_SETTINGS]: ../../api/DSL.md#defaultsettings
[ConsoleMethod]: ../..#consolemethod
[ResponseTiming]: ../..#responsetiming
[TestSettings]: ../../api/DSL.md#testsettings
[StepFunction]: ../..#stepfunction

[DEFAULT_SETTINGS]: ../..#defaultsettings