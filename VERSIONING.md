# Versioning Element

Element uses `lerna publish` to semantically advance version numbers across all packages. This workflow is automated.

Versions are based on branch:

- `stable`: stable releases e.g. `v1.1.0`, and tagged `latest` on npm.
- `beta`: beta releases e.g. `v1.1.0-beta.1` and tagged `beta` on npm.
- `canary`: canary releases e.g. `v1.1.0-canary.1` and tagged `canary` on npm.
- `feature/*`: any feature which will be merged into `canary`. These branches aren't published.

Versioning pipeline:

```
                     ┌───────────────┐   ┌───────────────┐   ┌───────────────┐   ┌───────────────┐
feature/*         ┌──►   feature/a   │ ┌─►   feature/b   │ ┌─►   feature/c   │   │   bugfix/*    │
                  │  └───────┬───────┘ │ └───────┬───────┘ │ └───────┬───────┘   └───────┬───────┘
                  │          │         │         │         │         │                   │
                  │  ┌───────▼───────┐ │ ┌───────▼───────┐ │ ┌───────▼───────┐           │
canary            │  │v1.0.1-canary.0├─┘ │v1.0.1-canary.1├─┘ │v1.0.1-canary.2│           │
                  │  └───────────────┘   └───────────────┘   └───────┬───────┘           │
                  │                                                  │                   │
                  │                                          ┌───────▼───────┐   ┌───────▼───────┐
beta              │                                          │ v1.0.1-beta.0 ├───► v1.0.1-beta.1 │
                  │                                          └───────────────┘   └───────┬───────┘
                  │                                                                      │
          ┌───────┴───────┐                                                      ┌───────▼───────┐
stable    │    v1.0.0     ├──────────────────────────────────────────────────────►    v1.0.0     │
          └───────────────┘                                                      └───────────────┘
```
