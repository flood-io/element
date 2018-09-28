# Developing element

## lerna & yarn workspaces

We're using [yarn workspaces](https://yarnpkg.com/en/docs/workspaces) to manage dependencies, and [lerna 3.x](https://github.com/lerna/lerna) for publishing to npm and other monorepo tasks.

## publishing

We do a custom build for `@flood/element` (`packages/element`) to provide more control over the package structure.

Because of that we also use a custom publishing script `scripts/publish.sh`

### prerelease

```shell
make publish-pre
```

## tests

### unit tests

```shell
yarn test
```

### smoke tests

```shell
make smoke
```
