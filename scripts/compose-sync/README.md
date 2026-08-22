# Compose sync tooling

This directory contains the deterministic bridge from pinned AndroidX Material3 generated token sources to reviewable TypeScript data in `@m3/tokens`.

It deliberately does **not** translate Kotlin component implementations. React/DOM behavior remains handwritten and is audited against the pinned AndroidX component/default/test sources.

## Pinned source

`manifest.mjs` is the source lock. It records:

- the AndroidX repository;
- the exact revision;
- the generated Material3 token root;
- every generated token source currently relevant to a ported foundation/component;
- the expected Git blob SHA for each source;
- the generated TypeScript output path when that source has been migrated to the raw generated layer.

The sync runner downloads the pinned raw bytes, recomputes Git's blob SHA locally, and rejects any mismatch before parsing or writing output.

## Commands

```sh
pnpm compose:sync
pnpm compose:sync:check
pnpm test:compose-sync
```

`compose:sync` regenerates migrated TypeScript token modules.

`compose:sync:check` is CI-safe: it verifies every tracked source blob, regenerates outputs in memory, and fails if committed generated files differ byte-for-byte.

`test:compose-sync` tests the parser without network access.

## Generated boundary

Generated files live under:

```text
packages/tokens/src/generated/androidx/
```

Each module records:

- repository and pinned revision;
- upstream source path;
- exact upstream blob SHA;
- upstream generated token version;
- AndroidX token object name;
- normalized immutable token data.

Production-facing files such as `state.ts`, `elevation.ts`, and `switch.ts` remain stable facades. They project generated AndroidX data into the public token API and may combine it with explicitly handwritten web/runtime adaptations.

Current bootstrap migration generates `ElevationTokens`, `StateTokens`, and `SwitchTokens`. The manifest already locks the remaining generated token files used by the components ported so far; those facades can be migrated incrementally without changing component APIs.

## Supported conversions

The parser intentionally supports only mechanical generated-token forms:

- numeric / opacity constants -> numbers;
- `18.0.dp` -> `18`;
- `ColorSchemeKeyTokens.Primary` -> `{ kind: 'color', value: 'primary' }`;
- `ElevationTokens.Level1` -> `{ kind: 'elevation', value: 'level1' }`;
- `ShapeKeyTokens.CornerFull` -> `{ kind: 'shape', value: 'full' }`;
- `TypographyKeyTokens.LabelLarge` -> `{ kind: 'typography', value: 'labelLarge' }`;
- references such as `ButtonSmallTokens.IconSize` -> typed normalized references.

Unsupported expressions or declaration shapes are fatal. The generator must never guess or silently fall back to `any`.

## Web/runtime adaptations stay handwritten

These are intentionally not disguised as generated Compose data:

- Compose spring sampling to CSS `linear()` timing functions;
- CSS shadow geometry for Material elevation;
- browser forced-colors behavior;
- DOM/RAC semantics;
- ripple wave implementation;
- component runtime state resolution implemented in AndroidX `Defaults`/component code rather than generated token files.

## Updating AndroidX

An upstream revision bump should be an explicit reviewed change:

1. change the pinned revision in `manifest.mjs`;
2. update the expected blob SHA entries for intentionally adopted source changes;
3. run `pnpm compose:sync`;
4. review generated diffs;
5. run defaults/behavior/visual parity tests for affected components;
6. document runtime source drift separately when generated token changes alter component behavior.

Do not point the generator at a moving AndroidX branch in normal builds or CI.
