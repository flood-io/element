# Versioning Element

Element uses `lerna publish` to semamtically advance version numbers across all packages. This workflow is automated.

Versions are based on branch:

- `master`: stable releases e.g. `v1.1.0`, and tagged `latest` on NPM.
- `beta`: next beta release e.g. `v1.1.0-beta.1` and tagged `beta` on NPM.
- `feature/*`: any feature which will be merged into `beta`. This branch isn't published.

Versioning pipeline:

```
           ┌────────────────┐                                         ┌────────────────┐
master     │     v1.0.0     │─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│     v1.1.0     │─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─▷
           └────────────────┘                                         └────────────────┘
                    │                                                          ▲
                    │        ┌────────────────┐      ┌────────────────┐        │       ┌────────────────┐
beta                └───────▶│ v1.0.1-beta.0  │─ ─ ─▶│ v1.1.0-beta.2  │────────┴──────▶│ v1.1.1-beta.0  │────▶
                             └────────────────┘      └────────────────┘                └────────────────┘
```
