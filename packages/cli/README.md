# Flood Element CLI

A tool for developing Flood Element test scripts.

Install Element CLI on your own machine to quickly iterate the development of your Browser Level User test script.
Once you're satisfied, upload it to [Tricentis Flood](https://flood.io) use it to generate 1000s of users of load in a full-scale load test.

- [Flood Element CLI](#flood-element-cli)
  \- [Installation](#installation)
  \- [Getting started](#getting-started)
  \- [`element run <file>`](#element-run-file)
  \- [`element plan <file> [options]`](#element-plan-file-options)
  \- [`element init [dir] [options]`](#element-init-dir-options)
  \- [`element generate <file>`](#element-generate-file)
  \- [`element generate config [file-name]`](#element-generate-config-file-name)
  \- [`element run`](#element-run)
  \- [`element run --config-file [path-to-config-file]`](#element-run---config-file-path-to-config-file)
  \- [Run an Element script on Flood](#run-an-element-script-on-flood)
  \- [`element flood authenticate <flood-api-token>`](#element-flood-authenticate-flood-api-token)
  \- [`element flood project ls`](#element-flood-project-ls)
  \- [`element flood use 'project-name'`](#element-flood-use-project-name)
  \- [`element flood project`](#element-flood-project)
  \- [`element flood run <path-to-script> [options]`](#element-flood-run-path-to-script-options)

## Installation

First, make sure you have installed the [latest version of NodeJS](https://nodejs.org) for your platform.

```bash
# Using yarn
yarn global add @flood/element-cli

# Using npm
npm install -g @flood/element-cli

# Verify install
element --version
```

## Getting started

Generate a test script environment

```shell
element init my-load-test
cd my-load-test

# edit the test script with your preferred editor
# in this example we're using VS Code
code test.ts
```

```shell
element run test.ts
```

### `element run <file>`

`element run test.ts` runs your test script against a local browser.

Note that if your script loads CSV or JSON test data, the file is assumed to be in the same directory as the test script.

#### `--watch`

`--watch` runs your test script, then re-runs it when the script is changed (when you save it in your editor for example).

`--watch` runs the test script against a single instance of the browser, so combining with `--no-headless` or `--devtools` shows the browser as the script runs, then leaves it open for you to inspect.

#### `--browser`

Specify the browser type used to run the test, using either `'chromium'` (default), `'firefox'` or `'webkit'`

#### `--executable-path`

Path to the installation folder of a custom Chromium-based browser, used to run the test. If set, Element will ignore the browser settings, and use this custom browser instead.

#### `--no-headless` / `--devtools`

While developing your script, it can be handy to watch the script as it works through the actions you've defined.

`--no-headless` simply shows the browser while your script works. Once the script ends the browser is closed.

`--devtools` shows the browser with Chrome Devtools open.

Consider combining these flags with `--watch`. This will leave the test browser open for you to explore the state of the page e.g. via Chrome Devtools.

#### `--ff` / `--slow-mo`

When running a script as a load test, you usually will set `actionDelay` and `stepDelay` to simulate users' think time, and perhaps to avoid overwhelming the target site.

While developing your script however, it might be useful to speed it up or slow it down by temporarily reducing or increasing `actionDelay` and `stepDelay`.

For example, when you want to iterate a tricky interaction quickly, speed the script up with `--ff`. Consider combining with `--watch`.

If debugging a complex interaction, slow the script down with `--slow-mo`. Consider combining with `--no-headless` or `--devtools` to watch the browser in action.

You can use `--ff N` and `--slow-mo N` to set the delays to N seconds.

You can also use `--step-delay TIME_IN_SECONDS` or `--action-delay TIME_IN_SECONDS`.

#### `--loop-count N`

Set the number of iterations to run your test for. Since `element run` is usually used for developing and debugging test scripts, this is `1` by default.

Setting a higher `--loop-count` could be useful for things like testing test data supply or generation.

#### `--no-sandbox`

Switch off the chrome sandbox. This is useful for some linux configurations which lack kernel support for the Chrome sandbox.

#### `--verbose`

Print out the Test Settings and some load testing metrics like `throughput`, `response_time`, `latency`, `transaction_rate`, `passed`, `failed` while the test is running.

#### `--strict` (DEPRECATED)

Compile your script with stricter typescript type-checking. This can be useful for writing more robust test scripts and sometimes as a debugging tool for discovering subtle problems with your script.

Specifically, this flag turns on the `strictNullChecks` and `noImplicitAny` TypeScript compiler flags. See the [TypeScript documentation](https://www.typescriptlang.org/docs/handbook/compiler-options.html) for more information.

#### `--work-root`

Specify a custom work root to save the test results. (Default: a directory named after your test script, under /tmp/element-results of your project folder)

#### `--test-data-root`

Specify a custom path to find test data files. (Default: the same directory as the test script)

### `element plan <file> [options]`

Output the test script plan without executing it.

**Options**

- `--json` (boolean) Output the test plan as JSON format. Defaults to `false`.

### `element init [dir] [options]`

Init a test script and a minimal environment to get you started with Flood Element.

**Positionals**

- `[dir]` (string) the directory to initialize with an Element test script. Defaults to the current directory.

**Options**

- `--skip-install` (boolean) Skip yarn/npm install. Defaults to `false`.

### `element generate <file>`

Generate a basic test script from a template.

### `element generate config [file-name]`

Generate a config file from a template.
Flood Element supports using a config file across tests within a project. The default config file name (if not specified) is element.config.js, with the content as below.

```js
module.exports = {
	options: {
		headless: true,
		devtools: false,
		sandbox: true,
		watch: false,
		stepDelay: 0,
		actionDelay: 0,
		loopCount: 1,
		strict: false,
		failStatusCode: 1,
		verbose: false,
	},
	paths: {
		workRoot: '.',
		testDataRoot: '.',
		testPathMatch: ['./*.perf.ts'],
	},
	flood: {
		hosted: false,
		virtualUsers: 500,
		duration: 15,
		rampup: 0,
		regions: [''],
	},
}
```

### `element run`

Run a test locally with the default config file

Element will find all the test scripts within the current project that match the `testPathMatch` pattern specified in the default config file, then sort the scripts alphabetically (by path-to-script) and execute those scripts sequentially, with the options as specified in the config file.

### `element run --config-file [path-to-config-file]`

Run a test locally with a custom config file

This would be useful in case you want to reuse a config file across different projects. Provide an optional path to config file in case you want to use another custom config file other than the default `element.config.js` file in the current project.

## Run an Element script on Flood

Since Element 1.3.0, you can launch a flood directly from Element CLI. To do so, you need to be authenticated with Flood first.

### `element flood authenticate <flood-api-token>`

Authenticate with Flood from Element CLI

Visit <https://app.flood.io/account/api> to get your API Token, then paste it into the above command to get authenticated. Unless you want to change the API Token, this step should be done only once.

### `element flood project ls`

List all Flood projects

### `element flood use 'project-name'`

Select a Flood project to use

or

```shell
element flood use <project-id>
```

Every flood needs to belong to a project. Therefore, you need to select a project to use before you can launch a flood.

### `element flood project`

Print the current project being used

This command would be useful in case you forgot the Flood project that is being used.

### `element flood run <path-to-script> [options]`

Launch a flood from CLI with a test script

**Options**

- `--hosted`: indicates you're going to run a flood on hosted grid. Ignore this option if you want to run an on-demand test.
- `--vu`: number of virtual users to simulate. Default to `500` if not specified
- `--duration`: length of the test, measured in minutes. Default to `15` minutes if not specified.
- `--rampup`: the amount of time it will take to reach the defined number of `vu`, measured in minutes. Default to `0` if not specified.

> **_NOTE:_**
> After running the command `element run flood`, you will be asked to select regions (to run on-demand test), or grids (to run a test on a hosted grid). To navigate among the options, use the Up/Down arrow key. To select an option, press the Space bar. You can select multiple options if you want.
