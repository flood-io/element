---
title: Element CLI
position: 1
articleGroup: Guides
---

The Element CLI is a powerful tool that makes it fast and easy to get started with browser level performance testing with Flood Element. It helps you scaffold a new project, then generate, write, validate, and run your scripts on your local machine. When you're ready, you can upload your test scripts to [Flood](https://flood.io) and be confident they’ll run exactly as expected, just like they did on your local machine.

- [Installation](#installation)
- [Getting help](#getting-help)
- [Initialize a new project](#initialize-a-new-project)
- [Generate a new test file](#generate-a-new-test-file)
- [Running a test script locally](#running-a-test-script-locally)
- [Tips on developing test scripts](#tips-on-developing-test-scripts)
  - [Watching for changes](#watching-for-changes)
  - [Inspecting the page](#inspecting-the-page)

## Installation

**Install using NPM:**

First, make sure you have installed the [latest version of NodeJS](https://nodejs.org) for your platform.

```bash
# Using yarn
yarn global add @flood/element-cli

# Using npm
npm install -g @flood/element-cli

# Verify install
element --version
```

## Getting help

The Element CLI comes with built in help that details the commands and options available. Run:

```bash
element help
```

to see a list of commands and global the Element CLI supports. To get more detailed information about a specific command, and the options it accepts, pass it the `--help` flag.

For example, to learn more about the `run` command and the options you can pass in, run:

```bash
element run --help
```


## Initialize a new project

Use the `init` command to initialize a new project. Your new project will include everything you need to get started, including TypeScript configuration, NodeJS dependencies, and a basic test script.

Element can create a new project directory for you:

```bash
element init my-element-project
```

or run it without a directory name to initialize your project in the current directory:

```bash
element init
```

With your new project setup, you can start writing a test by editing the newly generated `test.ts` file.

For more information on `element init`, run `element init --help`.


## Generate a new test file

Use the `generate` command to generate a basic test script that includes the necessary imports, some basic configuration, and an example test step. This is a complete test that you can run straight away to see immediate results and is a great starting point for writing you own tests.

The `generate` command takes the file name of your new script as input:

```bash
element generate my-load-test.ts
```

The command is interactive, allowing you to specify a custom title, and change the default URL used in the example step. These values can be changed later by editing the test script file.

## Running a test script locally

Use the `run` command to run a test script locally with Element. Your test script will be executed on your local machine in an instance of the Chrome browser. This is an excellent way to verify that your test runs as expected, before you increase the load.

```bash
element run my-element-test.ts
```

By default, tests run on the CLI have their `loop-count` setting overridden to 1. Running multiple iterations of a test is fantastic for testing load and working with test data but is unnecessary when verifying a script locally. You can change this behaviour by passing the `--loop-count` command line flag when running your test.

For more information on `element run`, run `element run --help`.

## Tips on developing test scripts

There are many useful command line flags that help writing and debugging tests scripts. See the command line help for the `run` command (`element run --help`) for a full list of options.

### Watching for changes

When developing a test script, it is incredibly useful to see the results of your steps as you write them. When you pass the `--watch` flag, the `run` command will watch your test script and rerun the test when it changes.

```bash
element run my-element-test.ts --watch
```

Every time you save a change to `my-element-test.ts` the test will run again, showing you the updated output.

### Inspecting the page

Taking screenshots is a fantastic way of getting a glimpse of your page at important points during your test. However, while writing scripts the ability to view and interact with the entire page can be incredibly useful. In the same way DevTools are invaluable when building an application, with Element they can be just as helpful when writing test scripts.

Passing the `--devtools` flag when running a script does two things: run in non-headless mode, and also open DevTools. A GUI instance of Chrome will be used to run your test (rather than headless, which is the default) allowing you to see the steps execute on the page as your script runs. Element also opens the DevTools, letting you view the console, select elements and debug the page. 

```bash
element run my-element-test.ts --devtools
```

Running tests in this way is especially useful when used in conjunction with [Browser.wait](../../api/Browser.md#browserwaittimeoutorcondition) to pause your script at specific points. This is a great technique for debugging a test script, or the page under test itself. If your test script interacts with many elements on a page (e.g. filling in a form), it is also an excellent way to capture element selectors.

> **Tip:**
>
> To see test steps execute without opening DevTools, use the `--no-headless` option instead.


[Flood]: https://flood.io

[Flood]: https://flood.io

[Flood]: https://flood.io

[Flood]: https://flood.io

[Flood]: https://flood.io

[Flood]: https://flood.io

[Flood]: https://flood.io

[Flood]: https://flood.io

[Flood]: https://flood.io
