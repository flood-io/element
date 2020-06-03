---
title: Installing the Element CLI
position: 2
articleGroup: Getting Started
gettingStartedOrder: 2
slug: /docs/1.0/install
---

The Element Command Line Interface (CLI) is a powerful tool that makes it fast and easy to get started with browser level performance testing with Flood Element. It helps you scaffold a new project, then generate, write, validate, and run your scripts on your local machine. When you're ready, you can upload your test scripts to [Flood](https://flood.io) and be confident they’ll run exactly as expected, just like they did on your local machine.

## Installation

**Install using NPM:**

First, make sure you have installed the [latest version of NodeJS][NodeJS] for your platform.

```bash
# Using yarn
yarn global add @flood/element-cli

# Using npm
npm install -g @flood/element-cli

# Verify install
element --version
```

**On macOS:**

If you are on macOS and don't already have NodeJS installed, consider installing `element` using homebrew.

```bash
brew install flood-io/taps/element
```

This will install `element` along with anything else it needs to run, such as NodeJS.


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

---

In the next section, we'll talk about how to create your first Element project.

[NodeJS]: https://nodejs.org
