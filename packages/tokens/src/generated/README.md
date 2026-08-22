# Generated Material tokens

Files under `androidx/` are generated from the exact AndroidX Material3 revision pinned in `scripts/compose-sync/manifest.mjs`.

Rules:

1. Do not edit generated files by hand; run `pnpm compose:sync`.
2. Every manifest token source has exactly one generated module; the full set is generated as one transactional batch.
3. Output is deterministic for a pinned source revision and exact upstream blob bytes.
4. Generated output contains data only: no React, DOM, CSS, or component behavior.
5. Every module records repository, revision, source path, blob SHA, upstream VERSION when available, declaration kind, and token object/class name.
6. Output uses normalized TypeScript data rather than Kotlin runtime objects.
7. CI runs `pnpm compose:sync:check` and rejects stale/manual/partial generated output.

Semantic references are normalized into explicit data, for example:

- `ColorSchemeKeyTokens.Primary` -> `{ kind: 'color', value: 'primary' }`;
- `ElevationTokens.Level1` -> `{ kind: 'elevation', value: 'level1' }`;
- `ShapeKeyTokens.CornerFull` -> `{ kind: 'shape', value: 'full' }`;
- `TypographyKeyTokens.LabelLarge` -> `{ kind: 'typography', value: 'labelLarge' }`;
- `18.0.dp` -> `18`;
- `14.sp` -> `{ kind: 'sp', value: 14 }`;
- constructors such as `RoundedCornerShape(...)` and `CubicBezierEasing(...)` -> normalized call data.

Platform-specific web adaptations such as ripple implementation, sampled CSS motion, forced-colors behavior, and web shadow geometry remain handwritten outside `generated/` and document their source separately.
