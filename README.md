# `@flood/element`

Flood Element brings the familiar power of traditional browser scripting tools with the proven performance of Flood to create an easy to use and maintainable performance testing tool.

Flood Element works by spinning up hundreds or even thousands of instances of Google Chrome, and running scripts you define here to drive a load test. We can this Browser Level Load Testing.

> This project is currently in beta and APIs are subject to change.

![Flood Element Example code](./docs/code-snippet.png)

# Quickstart

First, make sure you have installed the [latest version of NodeJS](https://nodejs.org) for your platform.

#### Using the Flood `element` CLI

Element ships with a useful command line tool to running your tests locally before scaling them up on Flood.

Install using yarn or NPM:

```bash
yarn global add @flood/element-cli

# or using NPM
npm install @flood/element-cli -g
```

Verify that you have it in your `PATH`:

```bash
$ element --version

Flood Element CLI: v1.0
```

#### 2. Initialize Project

The very first thing you should do is authenticate the `flood` tool with your Flood account. _If you don't have an account, you can sign up for free at [Flood](https://flood.io)._

TBD

#### 3. Write and validate your script

Edit `test.ts` in your editor of choice. To learn more about the scripting capabilities we've put together a detailed tutorial on [testing the "Flood Merchandice Store"](examples/scenario_1_wordpress.md).

As you're writing your script, you can validate it by running it on the Flood validation service:

```bash
flood verify test.ts
```

This will output a detailed list of steps and configuration options it has read from your script, then execute it within the Flood Element Environment.

#### 4. Run a real Load Test on [Flood](https://flood.io)

Now that you have a test script, upload it to [Flood](https://flood.io/app) as a new Stream and launch a Flood (a test).

![Upload your script to Tricentis Flood](examples/images/upload-script.png)

Continue learning more Flood Element techniques by starting with our API documentation. The main entry point to all tests is the <[Browser]> class and a great place to get a feel for the capabilities of each test.

## Why?

Over the years, countless customers have mentioned that getting started with Load Testing is a daunting task. That's why it's often left until the last minute before launch. At Flood, it's our mission to make Load Testing less daunting and accessible to everyone. We want to give developers and testers an easy way to ensure that whatever part of the system they're responsible for meets expectations for both functionality and performance.

## What can I do with it?

* Flood Element can be used to **put load on any web accessible application** and measure how it performs as load is ramped up,
* **Measure performance regressions** after deploys by integrating it with you CI/CD pipeline,
* Measure how your application's response time from different regions as experienced by your customers,
* Create **realistic load scenarios** which stress test your network infrastructure without developing a complex protocol level load test scripts.

## Documentation

* [Deep dive tutorial](examples/scenario_1_wordpress.md)
* [API Documentation](api/Browser.md)

## Developing

Element is a monorepo, using Lerna and Yarn to bootstrap dependencies between packages.

Ensure you have the latest version of `yarn` installed and workspaces enabled:

```
yarn config set workspaces-experimental true
```

Then bootstrap everything by running `yarn install` in the root of the project. This will install and symlink all the dependencies between all packages in `./packages/*`.

#### Run the `element` command from source:

You can now run the `element` command from source using `yarn element`.


## Reporting Issues

If you encounter any issues with the `@flood/element` project or Flood Element product, please [open an issue](https://github.com/flood-io/element/issues) on the GitHub project.

If you're encountering issues with Flood itself, please contact Flood Support from within the Flood Dashboard.
