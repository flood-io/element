---
title: Install
id: install
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

The Element Command Line Interface (CLI) is a powerful tool that makes it fast and easy to get started with browser level performance testing with Flood Element. It helps you scaffold a new project, then generate, write, validate, and run your scripts on your local machine. When you're ready, you can upload your test scripts to [Flood](https://flood.io) and be confident they’ll run exactly as expected, just like they did on your local machine.

:::info Choosing Yarn or NPM

We use the Yarn package manager throughout these docs, however, each command is has a compatible NPM equivelant.

:::


<Tabs
  groupId="operating-systems"
  defaultValue="mac"
  values={[
    {label: 'Windows', value: 'win'},
    {label: 'macOS', value: 'mac'},
    {label: 'Linux', value: 'linux'},
  ]
}>
  <TabItem value="mac">
  If you are on macOS and don't already have NodeJS installed, consider installing Element using homebrew.
  This will install Element along with anything else it needs to run, such as NodeJS.
Install using Homebrew:

```bash title="brew"
brew install floodio/taps/element
```

Or if you prefer using Yarn or NPM:

```bash title="yarn"
yarn global add element-cli
```

```bash title="NPM"
npm -g install element-cli
```


  </TabItem>
  <TabItem value="win">
Install using Yarn or NPM:

```bash title="yarn"
yarn global add element-cli
```

```bash title="NPM"
npm -g install element-cli
```

  </TabItem>
  <TabItem value="linux">
    Install using Yarn or NPM:

```bash title="yarn"
yarn global add element-cli
```

```bash title="NPM"
npm -g install element-cli
```

  </TabItem>
</Tabs>

## Local versioning

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