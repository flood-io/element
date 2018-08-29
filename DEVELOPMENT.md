# Developing element

## lerna & yarn workspaces

We're using [yarn workspaces](https://yarnpkg.com/en/docs/workspaces) to manage dependencies, and [lerna 2.x](https://github.com/lerna/lerna/tree/2.x) for publishing to npm and other monorepo tasks.

## tasks

### `yarn build:watch`

To ensure the packages resemble their production/built state while you're developing, use `yarn build:watch`.

### `yarn publish:pre`

To publish pre-release `yarn publish:pre`.
