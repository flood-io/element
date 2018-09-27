# `@flood/element`

Flood Element brings the familiar power of traditional browser scripting tools with the proven performance of Flood to create an easy to use and maintainable performance testing tool.

Flood Element works by spinning up hundreds or even thousands of instances of Google Chrome, and running scripts you define here to drive a load test. We can this Browser Level Load Testing.

> This project is currently in beta and APIs are subject to change.

![Flood Element Example code](./packages/element/docs/code-snippet.png)

# Quickstart

### 1. Install Element

#### On macOS

Select your preferred installation method:

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

**Install using homebrew:**

```bash
brew install flood-io/taps/flood
```

#### On linux

Download the [latest release](https://github.com/flood-io/cli/releases/latest) for your platform, then extract and install it:

```bash
# assuming you're installing version 1.0.0 on linux
cd ~/Downloads
mkdir flood
tar zxvf flood-1.0.0-linux-amd64.zip -C flood

# move the file to somewhere on your $PATH:
mv flood/flood /usr/local/bin/flood

# optionally, tidy up:
rm -rf flood
```

#### On Windows (EXPERIMENTAL)

First, make sure you have installed the [latest version of NodeJS](https://nodejs.org) for your platform.

```bash
# Using yarn
yarn global add @flood/element-cli

# Using npm
npm install -g @flood/element-cli

# Verify install
element --version
```

### 2. Initialize Project

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

#### 3. Write and validate your script

Edit `test.ts` in your editor of choice. To learn more about the scripting capabilities we've put together a detailed tutorial on [testing the "Flood Merchandice Store"](examples/scenario_1_wordpress.md).

As you're writing your script, you can validate it by running it locally using `element run`:

```bash
element run test.ts
```

This will run the script in an instance of Chrome and output the results locally.

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

## Reporting Issues

If you encounter any issues with the `@flood/element` project or Flood Element product, please [open an issue](https://github.com/flood-io/element/issues) on the GitHub project.

If you're encountering issues with Flood itself, please contact Flood Support from within the Flood Dashboard.
