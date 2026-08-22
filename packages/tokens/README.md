# @m3/tokens

Canonical Material 3 design-token package shared by `@m3/ui` and future consumers.

## Authority model

`tokens/**/*.json` is the **only authoritative token source in this repository**. It uses the DTCG `$type` / `$value` format and is owned, reviewed, and changed manually by this project.

AndroidX Compose, the Material 3 Figma Design Kit, Material Web, and other upstreams are references only. They may be parsed into temporary graphs for audit, but they must never generate or rewrite canonical DTCG files.

```text
AndroidX Compose ─┐
Figma M3 Kit ─────┼── normalize ──> read-only semantic diff
Material Web ─────┘                         │
                                           ▼
                                  tokens/**/*.json
                                  CANONICAL / REVIEWED
                                           │
                                           ▼
                                    Style Dictionary
                                           │
                             ┌─────────────┼─────────────┐
                             ▼             ▼             ▼
                            CSS            JS            JSON
```

The important consequence is that an upstream update cannot silently change the library. It can only make an audit fail. A maintainer then reviews the upstream change and deliberately edits the canonical token source if the project should adopt it.

## Package boundary

`@m3/tokens` must not depend on React, React Aria, DOM APIs, or `@m3/ui`. Runtime theme state does not belong here.

`ThemeProvider` owns runtime decisions such as light/dark schemes and dynamic color. Components consume immutable geometry, state opacity, typography, shape, motion and component defaults from this package. Runtime theme colors remain CSS-variable driven where the value is inherently dynamic.

## Canonical source

The initial prototype is `tokens/m3.json`. It covers enough core, Button, and Switch data to prove the architecture before migrating every existing handwritten token module.

Every canonical source must declare:

```json
{
  "$extensions": {
    "m3-ui": {
      "authority": "canonical",
      "policy": "manual-review"
    }
  }
}
```

`$extensions.m3-ui.references` may record upstream revisions used during review. That metadata is evidence, not authority.

## Validation and tests

- `pnpm --filter @m3/tokens validate` validates DTCG structure, ownership metadata, supported types, aliases and cycles.
- `pnpm --filter @m3/tokens test` runs validation plus unit tests for alias resolution and drift classification.
- `pnpm --filter @m3/tokens audit:androidx` parses the pinned AndroidX token sources and compares mapped values against canonical DTCG without writing files.

The package test script participates in the workspace `turbo test`, so canonical validation runs in normal CI.

## Style Dictionary

`style-dictionary.config.json` is the generation contract. It reads only `tokens/**/*.json` and defines CSS, JavaScript and nested JSON outputs. Style Dictionary is deliberately downstream of the canonical source; replacing a formatter must never redefine token ownership.

The repository currently keeps the existing TypeScript exports while this architecture is proven. The migration step is to generate those public exports from DTCG and then delete duplicate literals from `src/*.ts`.

## Upstream audit policy

Audits are asymmetric:

- canonical exists + upstream differs → `mismatch`;
- canonical exists + upstream disappeared → `missing-reference`;
- mapped upstream exists + canonical is absent → `missing-canonical`;
- equal semantic values → `match`.

Audit code must be read-only. Tests explicitly verify that comparison does not mutate either graph.
