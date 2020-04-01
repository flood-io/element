# Versioning Element

Element uses `lerna publish` to semamtically advance version numbers across all packages. This workflow is automated.

Versions are based on branch:

- `master`: stable releases e.g. `v1.0.10`, and tagged `v1` and `latest` on NPM
- `beta`: next beta release e.g. `v1.0.11` and tagged `beta` on NPM
- `feature/*`: any canary release e.g. `v1.0.11-feat-*.78`, and tagged `alpha` on NPM

Versioning pipeline:

`v1.0.0` <- `v1.0.1-beta.x` <- `v1.0.1` <- `v1.0.2-feat-awesome.x` <- `v1.0.2-beta.x` <- `v1.0.2`

- `master`: `v1.0.0` <- `v1.0.1`
- `beta`: `v1.0.1-beta.1` <- `v1.0.1-beta.2` <- `v1.0.1-beta.3`
