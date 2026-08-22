# Generated Material tokens

Files under `androidx/` are generated from the exact AndroidX Material3 revision pinned in `scripts/compose-sync/manifest.mjs`.

Rules:

1. Do not edit generated files by hand; run `pnpm compose:sync`.
2. Output is deterministic for a pinned source revision and exact upstream blob bytes.
3. Generated output contains data only: no React, DOM, CSS, or component behavior.
4. Every module records repository, revision, source path, blob SHA, upstream token version, and token object name.
5. Output uses idiomatic TypeScript data rather than Kotlin-shaped APIs.
6. CI runs `pnpm compose:sync:check` and rejects stale/manual generated output.

Semantic references are normalized into explicit typed data, for example:

- `ColorSchemeKeyTokens.Primary` -> `{ kind: 'color', value: 'primary' }`;
- `ElevationTokens.Level1` -> `{ kind: 'elevation', value: 'level1' }`;
- `ShapeKeyTokens.CornerFull` -> `{ kind: 'shape', value: 'full' }`;
- `TypographyKeyTokens.LabelLarge` -> `{ kind: 'typography', value: 'labelLarge' }`;
- `18.0.dp` -> `18`.

Platform-specific web adaptations such as ripple implementation, sampled CSS motion, forced-colors behavior, and web shadow geometry remain handwritten outside `generated/` and document their source separately.
