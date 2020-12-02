---
id: init
title: Initialize a project
---

Use the `init` command to initialize a new project. Your new project will include everything you need to get started, including TypeScript configuration, NodeJS dependencies, and a basic test script.

Element can create a new project directory for you:

```bash
element init my-element-project
```

or run it without a directory name to initialize your project in the current directory:

```bash
element init
```

Your new project will come with an automatically generated Element script, `test.ts`.

For more information on `element init`, run `element init --help`.

## Generate a new test file

If you'd like another test file, use the `generate` command to generate a basic test script that includes the necessary imports, some basic configuration, and an example test step. This is a complete test that you can run straight away to see immediate results and is a great starting point for writing your own tests.

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

The number of `loopCount`, unless specified in the [Test Settings](../guides/TestSettings.md), will default to `Infinity`, or `-1`, for an unlimited number of loops. Running multiple iterations of a test is fantastic for testing load and working with test data but may be unnecessary when verifying a script locally. You can change this behaviour by passing the `--loop-count` command line flag when running your test.

For more information on `element run`, run `element run --help`.

---

Now you are familiar with some of the commands in [Element CLI](../guides/CLI.md). Next we'll talk about scripting basics of Element.
