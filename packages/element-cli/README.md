# Element Command Line Interface `elementctl`

<p align="center">
  <a aria-label="Flood Logo" href="https://github.com/flood-io">
    <img src="https://img.shields.io/badge/MADE%20BY%20FLOOD-4285f4.svg?style=for-the-badge&labelColor=4285f4&logo=Flood&logoColor=FFFFFF">
  </a>
  <a aria-label="NPM version" href="https://www.npmjs.com/package/@flood/element-cli/">
    <img alt="" src="https://img.shields.io/npm/v/@flood/element-cli.svg?style=for-the-badge&labelColor=000000&color=6554C0">
  </a>
  <a aria-label="License" href="/LICENSE">
    <img alt="" src="https://img.shields.io/npm/l/@flood/element-cli.svg?style=for-the-badge&labelColor=000000">
  </a>
  <a aria-label="join us in spectrum" href="https://spectrum.chat/flood/element">
    <img alt="" src="https://img.shields.io/badge/Join%20the%20community-blueviolet.svg?style=for-the-badge&labelColor=000000">
  </a>
</p>

---

Flood Element is a browser based load generation tool built on top of Puppeteer. It provides an easy to use set of commands for automating most user interfaces, including mouse actions such as click and drag, keyboard key press actions, and working with inputs, buttons, and menus.

# CLI

## `element run <file.ts> [options]`

Run a test script locally.

**Browser:**

- `--chrome` Specify which version of Google Chrome to use. Default: use the puppeteer bundled version.
- `--no-headless` Run in non-headless mode so that you can see what the browser is doing as it runs the test
- `--devtools` Run in non-headless mode and also open devtools
- `--no-sandbox` Disable the chrome sandbox - advanced option, mostly necessary on linux

**Running the test script:**

- `--watch` Watch `<file>` and rerun the test when it changes.
- `--fast-forward`, `--ff` Run the script in fast-forward: override the `actionDelay` and `stepDelay` settings to 1 second in the test script Specify a number to set a different delay.
- `--slow-mo` Run the script in slow-motion: Increase the actionDelay and stepDelay settings in the test script to 10 seconds. Specify a number to set a different delay.
- `--step-delay` Override stepDelay test script setting
- `--action-delay` Override actionDelay test script setting
- `--loop-count` Override the loopCount setting in the test script. This is normally overridden to 1 when running via the CLI.
- `--strict` Compile the script in strict mode. This can be helpful in diagnosing problems.

**Paths:**

- `--work-root` Specify a custom work root. (Default: a directory named after your test script, and at the same location)
- `--test-data-root` Specify a custom path to find test data files. (Default: the same directory as the test script)

**Positionals:**

- file the test script to run
