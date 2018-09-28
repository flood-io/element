# Developing element

## lerna & yarn workspaces

We're using [yarn workspaces](https://yarnpkg.com/en/docs/workspaces) to manage dependencies, and [lerna 3.x](https://github.com/lerna/lerna) for versioning and other monorepo tasks.

## publishing

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
