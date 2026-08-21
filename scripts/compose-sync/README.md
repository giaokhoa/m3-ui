# Compose sync tooling

This directory is reserved for tooling that reads pinned AndroidX Material3 sources and produces reviewable TypeScript token/fixture data.

No generator implementation is added yet. This README defines the contract before code is written.

## Goals

The sync tooling should automate the parts of Compose parity that are mechanical and stable:

- source revision metadata;
- generated token extraction;
- conversion of Compose token references to TypeScript-native values;
- parity fixture generation;
- drift reports between two AndroidX revisions.

It should **not** generate React component implementations from Kotlin.

## Planned inputs

A future source manifest should record:

```text
repository
pinned commit SHA
Material3 module root
generated token directories
component source files
upstream test files
```

The source revision must be explicit and reproducible.

## Planned conversion rules

Centralize conversions such as:

- `ColorSchemeKeyTokens.Primary` -> `primary`;
- `TypographyKeyTokens.LabelLarge` -> `labelLarge`;
- `ShapeKeyTokens.CornerFull` -> `full`;
- `ElevationTokens.Level1` -> typed level `1`;
- `18.dp` -> numeric CSS-facing dimension `18`;
- opacity values -> number;
- token references -> typed keys rather than copied Kotlin objects.

All conversions should produce idiomatic TypeScript data.

## Suggested workflow

```text
fetch/verify pinned source
        ↓
parse supported token definitions
        ↓
normalize to an intermediate model
        ↓
validate unsupported constructs
        ↓
emit TypeScript generated tokens
        ↓
emit parity fixtures/source metadata
        ↓
format
        ↓
run parity tests + typecheck
```

## Safety rules

- fail loudly on unsupported syntax instead of guessing;
- never silently fall back to `any`;
- do not rewrite handwritten component files;
- generated files must include source metadata;
- generator output must be deterministic;
- upstream revision changes should produce a clear drift summary.

## Why not transpile Kotlin components?

React/DOM architecture is intentionally different from Compose runtime architecture. Generating component implementations would copy mechanisms such as `Modifier`, `CompositionLocal`, `InteractionSource`, and Compose layout primitives into TypeScript-shaped code.

Only token/reference data should be mechanically synchronized. Public React implementations remain handwritten according to the architecture in `docs/architecture/README.md`.
