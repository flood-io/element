---
id: cli
title: CLI reference
---

:::info

You can check the usage of any CLI command using the inbuilt `help` command.

e.g. Get help on the options for the `run` command:

```shell
element run help
```

:::

## Working with Element locally

### Init a local Element project

```shell
element init [dir] [options]
```

Init a test script, a default configuration file and a minimal environment to get you started with Flood Element.

**Positionals**

- `[dir]` (string) the directory to initialize with an Element test script. Defaults to the current directory.

**Options**

- `--skip-install` (boolean) Skip yarn/npm install. Defaults to `false`.

### Generate a basic test script from a template

```shell
element generate <file>
```

**Positionals**

- `file` (string) the test script name to generate. Specify a file name with a `.ts` extension (TypeScript), for example, `my-test-script.ts`.

You should make sure that `package.json` file in the project root folder has the attribute `name` before running this command.

### Output the test script plan without executing it

```shell
element plan <file> [options]
```

**Positionals**

- `file` (string) the test script (or path to the test script) to output the plan from. Specify a test script written in TypeScript with a `.ts` extension.

**Options**

- `--json` (boolean) Output the test plan as JSON format. Defaults to `false`.

### Run a test script locally

```shell
element run <file> [options]
```

**Positionals**

- `file` (string) the test script (or path to the test script) to run. Specify a test script written in TypeScript with a `.ts` extension.

**Options:**

  - `--chrome` Specify which version of Google Chrome to use. Default: use
    the puppeteer bundled version. Change it to `'stable'` to use the Chrome version installed on your system, or provide a path to use Chrome at the given path.
  - `--no-headless` Run in non-headless mode so that you can see what the browser is doing as it runs the test.
  - `--devtools` Run in non-headless mode and also open devtools
  - `--no-sandbox` Disable the chrome sandbox - advanced option, mostly necessary on linux.

- Running the test script:

  - `--watch` Watch `<file>` and rerun the test when it changes.
  - `--fast-forward`, `--ff` Run the script in fast-forward: override the actionDelay and stepDelay settings to 1 second in the test script. Specify a number to set a different delay.
  - `--slow-mo` Run the script in slow-motion: Increase the actionDelay
    and stepDelay settings in the test script to 10 seconds.
    Specify a number to set a different delay.
  - `--step-delay` Override stepDelay test script setting `[number]`
  - `--action-delay` Override actionDelay test script setting `[number]`
  - `--loop-count` Override the loopCount setting in the test script `[number]`
  - ~~`--strict` Compile the script in strict mode. This can be helpful
    in diagnosing problems.~~ `DEPRECATED`
  - `--fail-status-code` Specify an exit code when the test fails. Defaults to 1. `[number]`
  - `--config-file` Specify the path to a config file to run the test with. If a path is not specified, defaults to `element.config.js`. This flag only works when [running a test with a config file](cli#run-a-test-locally-with-the-default-config-file)

- Paths:

  - `--work-root` Specify a custom work root to save the test results. (Default: a directory named after your test script, under /tmp/element-results of your project folder)
  - `--test-data-root` Specify a custom path to find test data files. (Default: the
    same directory as the test script)

### Generate a config file from a template

```shell
element generate config [file-name]
```

Flood Element supports using a config file across tests within a project. The default config file name (if not specified) is `element.config.js`, with the content as below.

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

### Run a test locally with the default config file

```shell
element run
```

Element will find all the test scripts within the current project that match the `testPathMatch` pattern specified in the default config file, then sort the scripts alphabetically (by path-to-script) and execute those scripts sequentially, with the options as specified in the config file.

### Run a test locally with a custom config file

```shell
element run --config-file <path-to-config-file>
```

This would be useful in case you want to reuse a config file across different projects.

## Run an Element script on Flood

Since Element 1.3.0, you can launch a flood directly from Element CLI. To do so, you need to be authenticated with Flood first.

### Authenticate with Flood from Element CLI

```shell
element flood authenticate <flood-api-token>
```

Visit https://app.flood.io/account/api to get your API Token, then paste it into the above command to get authenticated. Unless you want to change the API Token, this step should be done only once.

### List all Flood projects

```shell
element flood project ls
```

### Select a Flood project to use

```shell
element flood use 'project-name (within quotation mark)'
```

or

```shell
element flood use <project-id>
```

Every flood needs to belong to a project. Therefore, you need to select a project to use before you can launch a flood.

### Print the current project being used

```shell
element flood project
```

This command would be useful in case you forgot the Flood project that is being used.

### Launch a flood on hosted grid

```shell
element flood run <path-to-script> --hosted --vu <number> --duration <minutes> --rampup <minutes>
```

- `--hosted`: indicates you're going to run a flood on hosted grid
- `--vu`: number of virtual users to simulate. Default to `500` if not specified
- `--duration`: length of the test, measured in minutes. Default to `15` minutes if not specified.
- `--rampup`: the amount of time it will take to reach the defined number of `vu`, measured in minutes. Default to `0` if not specified.

### Launch a flood using on-demand grid

```shell
element flood run <path-to-script> --vu <number> --duration <minutes> --rampup <minutes>
```

The meaning and default values for `--vu`, `--duration` and `--rampup` are the same as launching a flood on hosted grid, which are 500 (users), 15 (minutes) and 0 (minutes) respectively, if they are not specified in the command line.

:::info HOW TO NAVIGATE AND SELECT
After running the command `element run flood`, you will be asked to select regions (to run on-demand test), or grids (to run a test on a hosted grid). To navigate among the options, use the Up/Down arrow key. To select an option, press the Space bar. You can select multiple options if you want.
:::