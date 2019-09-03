# Developing Element

## `lerna` & `yarn` workspaces

We're using [yarn workspaces](https://yarnpkg.com/en/docs/workspaces) to manage dependencies, and [lerna 3.x](https://github.com/lerna/lerna) for versioning and other monorepo tasks.

## Releasing

We ship packages for each release in 3 formats:

- NPM (@flood/element)
- Homebrew (flood-io/taps/element)
- GitHub (tagged archive of source code)

Releases are published automatically and unceremoniously based upon commit history and branch name:

* `feature/*` is the canary release branch.
* `beta` is the beta release branch.
* `master` is the stable release branch.

Each time a feature is merged in to `beta`, the commit history is analysed and if it contains changes which require bumping the version, it will be bumped accordingly by `lerna` and `conventional-release` and prereleased with a "beta" tag.

In a similar way, each time `beta` is merged into `master`, the commit history is analysed and the version bumped as needed, this time without a beta tag.

All released on beta are tagged as `beta` on NPM, allowing you to install the latest beta with `@flood/element@beta` or the latest stable release with `@flood/element@latest`.

### Packages

**@flood/element**:

This package contains the core testing library of Element. The released package contains the TypeScript ambient definitions for the built source code.

**@flood/element-cli**:

This package contains the CLI code which you use to interact with Element on the commandline.

The contents of this package is a single file built using `ncc`.

<!-- ## publishing

We do a custom build for `@flood/element` (`packages/element`) to provide more control over the package structure.

Because of that we also use a custom publishing script `scripts/publish.sh`

## Branching

There are two main branches, `master` and `beta`. Pushing to either one automatically increments the versions using [`semver`](https://www.npmjs.com/package/semver) (via `lerna`)

### beta
Builds against `beta` increment the version using `semver -i prerelease --preid beta`.

```bash
0.0.2        => 0.0.3-beta.0
0.0.3.beta.0 => 0.0.3-beta.1
...
```

Therefore, PRs should be merged into `beta` so that they can be tested using a beta version of `element`.

**To promote `beta` to `master`:**

1. freshen local branches
  - git checkout beta
  - git pull
  - git checkout master
  - git pull
4. merge beta into master
  - git merge beta
  - git push
5. merge master into beta
  - git checkout beta
  - git merge master

### master

To cut a patch release, commit to master.

Builds against `master` increment the version using `semver -i patch`.

```bash
0.0.2 => 0.0.3
0.0.3.beta.0 => 0.0.3
...
```

**To do a minor or major release**:

TODO - probably need to do a manual version bump, or maybe have a commit message keyword.

## tests

### unit tests

```shell
yarn test
```

### smoke tests


```shell
make smoke
```
 -->
