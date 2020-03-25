# Developing Element

## `lerna` & `yarn` workspaces

We're using [yarn workspaces](https://yarnpkg.com/en/docs/workspaces) to manage dependencies, and [lerna 3.x](https://github.com/lerna/lerna) for versioning and other monorepo tasks.

## Commit message format

This repo has pre-commit hooks to enforce using semantic commit messagesm please see [CONTRIBUTING](./CONTRIBUTING.md)

## Releasing

We ship packages for each release in 3 formats:

- NPM (@flood/element)
- Homebrew (flood-io/taps/element)
- GitHub (tagged archive of source code)

Releases are published automatically and unceremoniously based upon commit history and branch name:

- `feature/*` is the canary release branch.
- `beta` is the beta release branch.
- `master` is the stable release branch.

Each time a feature is merged in to `beta`, the commit history is analysed and if it contains changes which require bumping the version, it will be bumped accordingly by `lerna` and `conventional-release` and prereleased with a "beta" tag.

In a similar way, each time `beta` is merged into `master`, the commit history is analysed and the version bumped as needed, this time without a beta tag.

NPM releases are handled in CI automatically so that shipping releases isn't a big deal, it should be something we do regularly.


### Packages

In the `./packages/` directory...

- `core` (`@flood/element-core`)

This package contains the core testing library of Element. The released package contains the TypeScript ambient definitions for the built source code.

- `compiler` (`@flood/element-compiler`)

Contains the script compiler. This is used to transform the test scripts written by customers in TypeScript to a JavaScript bundle which is loaded into the VM.

- `cli` (`@flood/element-cli`)

This package contains the CLI code which you use to interact with Element on the commandline.

- `flood-runner` (`@flood/element-flood-runner`)

This is the adapter for running Element tests on Flood.io, it adds an additional command to the CLI (`element agent start`) and a wire protocol reporter which emits results in the Flood Reporting Wire Protocol used by all our tools.

- `element-cli` (`element-cli`)

A work in progress to wrap all Element packages into a single easy to remember package for local usage.

- `element-api` (`@flood/element-api`)

Public API for Element testing functionality. DEPRECATED.

- `element` (`@flood/element`)

Public API for Element testing functionality.

