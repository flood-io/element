[![Flood Element](/assets/Repo-header.png)](https://element.flood.io)

<p align="center">
  <a aria-label="Flood Logo" href="https://github.com/flood-io">
    <img src="https://img.shields.io/badge/MADE%20BY%20FLOOD-4285f4.svg?style=for-the-badge&labelColor=4285f4&logo=Flood&logoColor=FFFFFF">
  </a>
  <a aria-label="NPM version" href="https://www.npmjs.com/package/element-cli/">
    <img alt="" src="https://img.shields.io/npm/v/element-cli.svg?style=for-the-badge&labelColor=000000&color=6554C0">
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

Element is designed purely to generate load by simulating real user behaviour within a browser. It does not attempt to manipulate the page or work with any specific front-end framework, although it works great for testing SPAs built in React, Angular, Ember, or any other JS heavy client framework.

The goals of Element scripts are to be:

- Understandable
- Easy to write and maintain
- Declarative for expressing user actions

Scaling up Element tests is easy on [Flood](https://flood.io), by launching hundreds or even thousands of instances of Google Chrome, and running the scripts you write to drive a load test. We call this Browser Level Load Testing.

- [Quickstart](#quickstart)
  - [1. Install Element](#1-install-element)
    - [Stable release](#stable-release)
    - [Beta release](#beta-release)
		- [Canary release](#canary-release)

  - [2. Initialize Your Project](#2-initialize-your-project)
  - [3. Write and Validate Your Script](#3-write-and-validate-your-script)
  - [4. Run a real Load Test on Flood](#4-run-a-real-load-test-on-flood)
- [About](#about)
  - [What can I do with it?](#what-can-i-do-with-it)
- [Do more with Element](#do-more-with-element)
- [Contributing](#contributing)
- [Reporting Issues](#reporting-issues)
- [Authors](#authors)

## Quickstart

### 1. Install Element

**Install using NPM:**

First, make sure you have installed the [latest version of NodeJS](https://nodejs.org) for your platform.

#### Stable release

<a aria-label="NPM version" href="https://www.npmjs.com/package/element-cli/">
  <img alt="" src="https://img.shields.io/npm/v/element-cli.svg?style=for-the-badge&labelColor=000000&color=6554C0">
</a>

```bash
# Using yarn
yarn global add element-cli

# Using npm
npm i -g element-cli

# Verify install
element --version
```

**On macOS:**

If you are on macOS and don't already have NodeJS installed, consider installing `element` using homebrew.

```bash
brew install flood-io/taps/element
```

This will install `element` along with anything else it needs to run, such as NodeJS.

#### Beta release

<a aria-label="Beta NPM version" href="https://www.npmjs.com/package/element-cli/">
  <img alt="" src="https://img.shields.io/npm/v/element-cli/beta.svg?style=for-the-badge&labelColor=000000">
</a>

```bash
# Using yarn
yarn global add element-cli@beta

# Using npm
npm i -g element-cli@beta

# Verify install
element --version
```

#### Canary release
<a aria-label="Canary NPM version" href="https://www.npmjs.com/package/element-cli/">
  <img alt="" src="https://img.shields.io/npm/v/element-cli/canary.svg?style=for-the-badge&labelColor=000000">
</a>

```bash
# Using yarn
yarn global add element-cli@canary

# Using npm
npm i -g element-cli@canary

# Verify install
element --version
```

### 2. Initialize Your Project

Using the `element` command, you can generate a new project or generate a test within your existing project.

**Generate a new project**

```bash
element init ./my-element-project
```

This will create a new project an test.ts file with a single step stubbed out for you.

**Or, generate a new file**

```bash
element generate load-test-dashboard
```

This will create a new file with a single step stubbed out for you.

### 3. Write and Validate Your Script

Edit `test.ts` in your editor of choice. To learn more about the scripting capabilities we've put together a detailed tutorial on [testing the "Flood Merchandise Store"](./packages/element/docs/examples/scenario_1_wordpress.md).

As you're writing your script, you can validate it by running it locally using `element run`:

```bash
element run test.ts
```

This will run the script in an instance of Chrome and output the results locally.

For details of the available options see the [`element run`](./packages/cli/README.md#element-run) guide.

### 4. Run a real Load Test on [Flood](https://flood.io)

Now that you have a test script, upload it to [Flood](https://app.flood.io) as a [new Stream](https://guides.flood.io/scripting-and-tools/flood-element/getting-started-with-element#create-a-stream) and launch a Flood (a test).

Since Element version 1.3, you can [launch a flood directly from Element CLI](https://element.flood.io/docs/next/guides/cli#run-an-element-script-on-flood)

## About

Over the years, countless customers have mentioned that getting started with Load Testing is a daunting task. That's why it's often left until the last minute before launch. At Flood, it's our mission to make Load Testing less daunting and accessible to everyone. We want to give developers and testers an easy way to ensure that whatever part of the system they're responsible for meets expectations for both functionality and performance.

### What can I do with it?

- Flood Element can be used to **apply load to any web accessible application** and measure how it performs as the load is ramped up.
- **Measure performance regressions** after deploys by integrating it with your CI/CD pipeline.
- Measure your application's response time from different regions as experienced by your customers.
- Create **realistic load scenarios** which stress test your network infrastructure without developing complex protocol level load test scripts.

## Do more with Element
Continue learning more Flood Element techniques by starting with our [API documentation](https://element.flood.io/docs/). The main entry point to all tests is the [Browser](https://element.flood.io/docs/1.0/api/browser) class and a great place to get a feel for the capabilities of each test.

Visit <a aria-label="Element documentation" href="https://element.flood.io">https://element.flood.io</a> to view the documentation.

## Contributing

Please see our [CONTRIBUTING.md](/CONTRIBUTING.md).

## Reporting Issues

If you encounter any issues with the `@flood/element` project or Flood Element product, please [open an issue](https://github.com/flood-io/element/issues) on the GitHub project.

If you're encountering issues with Flood itself, please contact Flood Support from within the Flood Dashboard, [send us an email](mailto:support@flood.io) or [ask our community](https://spectrum.chat/flood).

## Authors

- Ivan Vanderbyl ([@ivanderbyl](https://twitter.com/ivanderbyl)) – [Flood](https://flood.io)
- Lachie Cox ([@lachiecox](https://twitter.com/lachiecox)) – [Flood](https://flood.io)
