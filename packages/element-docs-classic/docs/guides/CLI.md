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

## `element init [dir] [options]`

Init a test script and a minimal environment to get you started with Flood Element.

## `element generate <file> [options]`

Generate a basic test script from a template.

## `element plan <file> [options]`

Output the test script plan without executing it

## `element run <file> [options]`

Run a test script locally

**Options:**

Browser:

- `--chrome` Specify which version of Google Chrome to use. Default: use
  the puppeteer bundled version.
- `--no-headless` Run in non-headless mode so that you can see what the browser is doing as it runs the test.
- `--devtools` Run in non-headless mode and also open devtools
- `--no-sandbox` Disable the chrome sandbox - advanced option, mostly necessary on linux.

Running the test script:

- `--watch` Watch `<file>` and rerun the test when it changes.
- `--fast-forward`, `--ff` Run the script in fast-forward: override the actionDelay and stepDelay settings to 1 second in the test script. Specify a number to set a different delay.
- `--slow-mo` Run the script in slow-motion: Increase the actionDelay
  and stepDelay settings in the test script to 10 seconds.
  Specify a number to set a different delay.
- `--step-delay` Override stepDelay test script setting `[number]`
- `--action-delay` Override actionDelay test script setting `[number]`
- `--loop-count` Override the loopCount setting in the test script. This
  is normally overridden to 1 when running via the cli.
  `[number][default: 1]`
- ~~`--strict` Compile the script in strict mode. This can be helpful
  in diagnosing problems.~~ `DEPRECATED`

Paths:

- `--work-root` Specify a custom work root. (Default: a directory named
  after your test script, and at the same location)
- `--test-data-root` Specify a custom path to find test data files. (Default: the
  same directory as the test script)

Positionals:

1.  `file` the test script to run. Specifies a test script written in TypeScript with a `.ts` extension.
