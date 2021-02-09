---
id: changelog
title: Changelog
---

## 2.0.0
Released: Feb 2021

### New features
- Renovate the CLI to be more professional and user-friendly, for a better developer experience.
- Replace Puppeteer core with Microsoft's Playwright.
- Support running tests on different browsers including Chromium, Chrome, Firefox, and Webkit with [browser](../guides/test-settings#browser) setting or [`--browser`][cli-run] CLI flag.
- Support running tests with a custom version of Microsoft Edge, Google Chrome or any Chromium-based browsers by *executablePath* property in [browserLaunchOptions](../guides/test-settings#browserlaunchoptions) setting or [`--executablePath`][cli-run] CLI flag.
- Support [simulating multiple users on the local machine](../guides/test-settings#stages), with the ability to ramp up or down.
- Generate an HTML report of the final test results with [`--mu`][cli-run] CLI flag.
- New APIs:
  - [`browser.drag()`](../api/browser#dragsourceelement-targetelement)
  - [`browser.getCookies()`](../api/browser#getcookiesfilterby)
  - [`ElementHandle.drag()`](../api/element-handle#dragtargetelement)

### Enhancements
- Add the ability to show screenshot on the terminal output *(only for iTerms2 on MacOS)* with `--show-screenshot` option [when running test scripts locally](../guides/cli#run-a-test-script-locally).
- Re-organize priorities order to get test setting values [when running test scripts](../guides/cli#run-a-test-script-locally).

### Deprecated
- [`--chrome`](../guides/cli#run-a-test-script-locally) CLI flag
- [`chromeVersion`](../guides/test-settings#chromeversion-deprecated-since-version-20) setting in Test Settings
- [`suite`](../api/env#suite-deprecated-since-version-20)
- [`browser.highlightElement()`](../api/browser#highlightelementelement-deprecated-since-version-20)
- [`ElementHandle.highlight()`](../api/element-handle#highlight-deprecated-since-version-20)

## 1.5.0
Released: Jan 2021

### New features
- Ability to support [multiple data files in a single test script](../guides/TestData.md#using-multiple-test-data-files-in-a-single-test-script)
- Ability to [debug Element script with VSCode](../guides/editor.md#how-to-debug-element-script-with-vscode)
- Updated [Puppeteer](https://pptr.dev/) to the latest version (5.5.0)
- New APIs:
  - [`browser.scrollBy()`](../api/browser#scrollbyx-y-options)
  - [`browser.scrollTo()`](../api/browser#scrolltoposition-options)
  - [`browser.getMimeType()`](../api/browser#getmimetypefilepath)
  - [`browser.getUrl()`](../api/browser#geturl)

## 1.3.6
Released: 24 Sep 2020

### Enhancements
- Show Element version and Node version in terminal while running tests

### Bugfixes
- `ElementHandle.uploadFile()` has been implemented but is not exposed in the API
- `Browser.wait()` returns value of type boolean only

## 1.3.3
Released: 18 Sep 2020

### Bugfixes
- Backward compatible with legacy test scripts (actionDelay & stepDelay time measurement unit)
- `--watch` option not working
- `consoleFilter` settings not working
- `browser.sendKeys()` does not work if `TestSettings.waitUntil` is enabled
- Error on authenticating with Flood from Element CLI


## 1.3.0
Released: Aug 2020

### New features
- Extended Step Types:
  - [`step.if()`](../guides/script.md#stepif)
  - [`step.unless()`](../guides/script.md#stepunless)
  - [`step.while()`](../guides/script.md#stepwhile)
  - [`step.repeat()`](../guides/script.md#steprepeat)
  - [`step.once()`](../guides/script.md#steponce)
  - [`step.skip()`](../guides/script.md#stepskip)
  - [`step.recovery()`](../guides/script.md#steprecovery)

- Hooks for setup and teardown
  - [`beforeAll()`](../guides/hook.md#beforeAll)
  - [`beforeEach()`](../guides/hook.md#beforeEach)
  - [`afterEach()`](../guides/hook.md#afterEach)
  - [`afterAll()`](../guides/hook.md#afterAll)

- Support sending key combinations [(`browser.sendKeyCombinations()`)](../api/Browser.md#sendkeycombinationskeys)
- Support authentication with Flood and [lauching a flood directly from Element CLI](../guides/CLI.md#run-an-element-script-on-flood)
- New command to [generate a config file](../guides/CLI.md#generate-a-config-file-from-a-template) and [run a test from a config file](../guides/CLI.md#run-a-test-locally-with-the-default-config-file)
- Ability to set a Fail Status Code (ExitCode) if a test fails [when running locally](../guides/CLI.md#run-a-test-script-locally) 

### Enhancements
- Handle multiple tabs/windows (GitHub issue [#47](https://github.com/flood-io/element/issues/47))
- Refactor code and fix dependencies life cycle issue (GitHub issue [#176](https://github.com/flood-io/element/issues/176))
- Add [`Until.elementTextDoesNotMatch()`](../api/Waiters.md)
- Support importing script helper from other node modules (GitHub issue [#71](https://github.com/flood-io/element/issues/71))
- Make process.env reflect environment variables present when running `element run` (GitHub issue [#104](https://github.com/flood-io/element/issues/104))

### Bugfixes
- Fix homebrew publish of Element (GitHub issue [#135](https://github.com/flood-io/element/issues/135))
- Unable to use the command `element generate <file.ts>` (GitHub issue [#165](https://github.com/flood-io/element/issues/165))
- Setting `recoveryTries` does not work (GitHub issue [#195](https://github.com/flood-io/element/issues/195))
- Exit status of `element run test.ts` to reflect test passing/failing (GitHub issue [#30](https://github.com/flood-io/element/issues/30))
- Setting `screenshotOnFailure():true` does not create a screenshot on failure (GitHub issue [#87](https://github.com/flood-io/element/issues/87))
- Getting error `responded with status code 401. Element expected a status code 200-299 or 300-399` (GitHub issue [#146](https://github.com/flood-io/element/issues/146))

[cli-run]: ../guides/cli#run-a-test-script-locally