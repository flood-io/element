---
title: Install
id: install
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

The Element Command Line Interface (CLI) is a powerful tool that makes it fast and easy to get started with browser level performance testing with Flood Element. It helps you scaffold a new project, then generate, write, validate, and run your scripts on your local machine. When you're ready, you can upload your test scripts to [Flood](https://flood.io) and be confident they’ll run exactly as expected, just like they did on your local machine.

:::info Choosing Yarn or NPM

We suggest using the Yarn package manager for better performance, however, each command has a compatible NPM equivelant.

:::

:::info Flood Support
Element 2.0 is not enabled by default on [Flood](https://flood.io) and is in Preview mode. Please [contact support](https://flood.io/support) if you would like to enable its use on your account.

The current default version of Element run on [Flood](https://flood.io) is version 1.5, please visit [the documentation for Element 1.5](https://element.flood.io/docs/1.5/) if the Element 2.0 Preview has not been enabled on your account.

A list of the default versions of all tools run on [Flood](https://flood.io) is available within the [Default tool versions](https://guides.flood.io/scripting-and-tools/default-tool-versions) guide.
:::

## Global installation

First, make sure you have installed the [latest version of NodeJS](https://nodejs.org) for your platform (MacOS, Windows or Linux).

### Stable release

<a aria-label="NPM version" href="https://www.npmjs.com/package/element-cli/">
  <img alt="" src="https://img.shields.io/npm/v/element-cli.svg?style=for-the-badge&labelColor=000000&color=6554C0"/>
</a>

<Tabs
  groupId="stable"
  defaultValue="yarn"
  values={[
    {label: 'Yarn', value: 'yarn'},
    {label: 'NPM', value: 'npm'},
  ]
}>
  <TabItem value="yarn">

```bash title="yarn"
# Install
yarn global add element-cli

# Verify installation
element --version
```

  </TabItem>
  <TabItem value="npm">

```bash title="npm"
# Install
npm -g install element-cli

# Verify installation
element --version
```

  </TabItem>
</Tabs>

This will install the latest stable version of Element CLI, together with other Element dependencies, globally on your machine.

### Beta release

<a aria-label="Beta NPM version" href="https://www.npmjs.com/package/element-cli/">
  <img alt="" src="https://img.shields.io/npm/v/element-cli/beta.svg?style=for-the-badge&labelColor=000000"/>
</a>

<Tabs
  groupId="beta"
  defaultValue="yarn"
  values={[
    {label: 'Yarn', value: 'yarn'},
    {label: 'NPM', value: 'npm'},
  ]
}>
  <TabItem value="yarn">

```bash title="yarn"
# Install
yarn global add element-cli@beta

# Verify installation
element --version
```

  </TabItem>
  <TabItem value="npm">

```bash title="npm"
# Install
npm -g install element-cli@beta

# Verify installation
element --version
```

  </TabItem>
</Tabs>

### Canary release

<a aria-label="Canary NPM version" href="https://www.npmjs.com/package/element-cli/">
  <img alt="" src="https://img.shields.io/npm/v/element-cli/canary.svg?style=for-the-badge&labelColor=000000"/>
</a>

<Tabs
  groupId="canary"
  defaultValue="yarn"
  values={[
    {label: 'Yarn', value: 'yarn'},
    {label: 'NPM', value: 'npm'},
  ]
}>
  <TabItem value="yarn">

```bash title="yarn"
# Install
yarn global add element-cli@beta

# Verify installation
element --version
```

  </TabItem>
  <TabItem value="npm">

```bash title="npm"
# Install
npm -g install element-cli@beta

# Verify installation
element --version
```

  </TabItem>
</Tabs>

## Local versioning

If you want to install a specific version of Element to use in a local project, just `cd` to the project folder, then install by adding a `@version-tag`, and removing the `global` (or `-g` on NPM) keyword.

<Tabs
  groupId="specific-version"
  defaultValue="yarn"
  values={[
    {label: 'Yarn', value: 'yarn'},
    {label: 'NPM', value: 'npm'},
  ]
}>
  <TabItem value="yarn">

```bash title="yarn"
# Install Element version 1.3.8
yarn add element-cli@1.5.1

# Verify installation
element --version
```

  </TabItem>
  <TabItem value="npm">

```bash title="npm"
# Install Element version 1.3.8
npm install element-cli@1.5.1

# Verify installation
element --version
```

  </TabItem>
</Tabs>

For full list of Element versions, visit [here](https://www.npmjs.com/package/@flood/element-cli?activeTab=versions).
To view the release notes of each version, visit [here](https://element.flood.io/docs/next/start/changelog)

Element is smart enough to detect whether you're using a custom version of Element locally or using the global install.

If you add element-cli to your local project `package.json`, Element will use that version, otherwise, it will default to your global version.

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
