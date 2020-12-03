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

### Output the test script plan without executing it

```shell
element plan <file> [options]
```
**Options**
- `--json` (boolean) Output the test plan as JSON format. Defaults to `false`.

### Run a test script locally

```shell
element run <file> [options]
```

Positionals:

**file:** the test script (or path to the test script) to run. Specifies a test script written in TypeScript with a `.ts` extension.

**options:**

- Browser:

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

- Paths:

  - `--work-root` Specify a custom work root to save the test results. (Default: a directory named after your test script, under /tmp/element-results of your project folder)
  - `--test-data-root` Specify a custom path to find test data files. (Default: the
  same directory as the test script)


