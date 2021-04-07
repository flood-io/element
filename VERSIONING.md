# Versioning Element

Element uses `lerna publish` to semantically advance version numbers across all packages. This workflow is automated.

Versions are based on branch:

- `stable`: stable releases e.g. `v1.1.0`, and tagged `latest` on NPM.
- `beta`: beta releases e.g. `v1.1.0-beta.1` and tagged `beta` on NPM.
- `canary`: canary releases e.g. `v1.1.0-canary.1` and tagged `canary` on NPM.
- `feature/*`: any feature which will be merged into `canary`. These branches aren't published.

Versioning pipeline:

```
           ┌────────────────┐                                         ┌────────────────┐
stable     │     v1.0.0     │─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│     v1.1.0     │─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─▷
           └────────────────┘                                         └────────────────┘
                    │                                                          ▲
                    │        ┌────────────────┐      ┌────────────────┐        │       ┌────────────────┐
beta                └───────▶│ v1.0.1-beta.0  │─ ─ ─▶│ v1.1.0-beta.2  │────────┴──────▶│ v1.1.1-beta.0  │────▶
                             └────────────────┘      └────────────────┘                └────────────────┘
```
