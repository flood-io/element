# Flood Element CLI

A tool for developing Flood Element test scripts.

Install Element CLI on your own machine to quickly iterate the development of your Browser Level User test script. Once you're satisfied, upload it to [Tricentis Flood](https://flood.io) use it to generate 1000s of users of load in a full-scale load test.

* [Installation](cli.md#installation)
* [Getting started](cli.md#getting-started)
* Commands
  * [`element run`](cli.md#element-run)
  * [`element plan`](cli.md#element-plan)
  * [`element init`](cli.md#element-init)
  * [`element generate`](cli.md#element-generate)

## Installation

The easiest way to install on MacOS is via [homebrew](https://brew.sh):

```text
brew install flood-io/taps/element
```

### via npm or yarn

If you're installing as an npm package, please first ensure you have the most recent version of node installed.

```text
# npm:
npm install -g @flood/element-cli
# yarn
yarn global add @flood/element-cli
```

## Getting started

Generate a test script environment

```text
element init my-load-test
cd my-load-test

# edit the test script with your preferred editor
# in this example we're using VS Code
code test.ts
```

```text
element run test.ts
```

## `element run`

`element run test.ts` runs one iteration of your test script against a local browser.

Note that if your script loads CSV or JSON test data, the file is assumed to be in the same directory as the test script.

### `--watch`

`--watch` runs your test script, then re-runs it when the script is changed \(when you save it in your editor for example\).

`--watch` runs the test script against a single instance of the browser, so combining with `--no-headless` or `--devtools` shows the browser as the script runs, then leaves it open for you to inspect.

### `--no-headless` / `--devtools`

While developing your script, it can be handy to watch the script as it works through the actions you've defined.

`--no-headless` simply shows the browser while your script works. Once the script ends the browser is closed.

`--devtools` shows the browser with Chrome Devtools open.

Consider combining these flags with `--watch`. This will leave the test browser open for you to explore the state of the page e.g. via Chrome Devtools.

### `--ff` / `--slow-mo`

When running a script as a load test, you usually will set `actionDelay` and `stepDelay` to simulate users' think time, and perhaps to avoid overwhelming the target site.

While developing your script however, it might be useful to speed it up or slow it down by temporarily reducing or increasing `actionDelay` and `stepDelay`.

For example, when you want to iterate a tricky interaction quickly, speed the script up with `--ff`. Consider combining with `--watch`.

If debugging a complex interaction, slow the script down with `--slow-mo`. Consider combining with `--no-headless` or `--devtools` to watch the browser in action.

You can use `--ff N` and `--slow-mo N` to set the delays to N seconds.

You can also use `--step-delay TIME_IN_SECONDS` or `--action-delay TIME_IN_SECONDS`.

### `--loop-count N`

Set the number of iterations to run your test for. Since `element run` is usually used for developing and debugging test scripts, this is `1` by default.

Setting a higher `--loop-count` could be useful for things like testing test data supply or generation.

### `--chrome-version <custom-chrome-path>`

Set the version of chrome to use. By default, `element run` uses the version of Chromium bundled with puppeteer.

* `--chrome-version` with no arguments attempts to find and use the version of Chrome installed on your system.
* `--chrome-version /path/to/chrome` will use Chrome at the given path.

Note that when running as a load test [Tricentis Flood](https://flood.io), the versions of Chrome are recent but fixed to particular versions and may not match the custom version you select with this flag. Using the puppeteer-bundled version is a safe choice unless you need to test features which Chromium doesn't support such as DRM video playback.

### `--no-sandbox`

Switch off the chrome sandbox. This is useful for some linux configurations which lack kernel support for the Chrome sandbox.

### `--verbose`

### \(advanced\) `--strict`

Compile your script with stricter typescript type-checking. This can be useful for writing more robust test scripts and sometimes as a debugging tool for discovering subtle problems with your script.

Specifically, this flag turns on the `strictNullChecks` and `noImplicitAny` TypeScript compiler flags. See the [TypeScript documentation](https://www.typescriptlang.org/docs/handbook/compiler-options.html) for more information.

### \(advanced\) `--work-root`

### \(advanced\) `--test-data-root`

## `element plan`

TODO

## `element init`

TODO

## `element generate`

TODO

