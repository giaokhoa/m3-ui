# Generated Material tokens

Files under `androidx/` are generated from the exact AndroidX Material3 revision and token directory pinned in `scripts/compose-sync/manifest.mjs`.

Rules:

1. Do not edit generated files by hand; run `pnpm compose:sync`.
2. The generator discovers every direct upstream `*Tokens.kt`; there is no handwritten per-component source allowlist.
3. At the current pinned revision the snapshot contains 120 generated token modules plus the barrel, all parsed/rendered as one transactional batch.
4. Output is deterministic for the pinned revision and is verified against each upstream Git blob SHA.
5. Generated output contains data only: no React, DOM, CSS or component behavior.
6. Every module records repository, revision, source path, blob SHA, upstream VERSION when available, declaration kind and token object/class name.
7. CI runs `pnpm compose:sync:check` and rejects stale, extra, missing, manual or partial generated output.

Semantic references are normalized into explicit data, for example:

- `ColorSchemeKeyTokens.Primary` -> `{ kind: 'color', value: 'primary' }`;
- `ElevationTokens.Level1` -> `{ kind: 'elevation', value: 'level1' }`;
- `ShapeKeyTokens.CornerFull` -> `{ kind: 'shape', value: 'full' }`;
- `TypographyKeyTokens.LabelLarge` -> `{ kind: 'typography', value: 'labelLarge' }`;
- `18.0.dp` -> `18`;
- `14.sp` -> `{ kind: 'sp', value: 14 }`;
- constructors such as `RoundedCornerShape(...)` and `CubicBezierEasing(...)` -> normalized call data.

Platform-specific web adaptations such as ripple implementation, sampled CSS motion, forced-colors behavior and web shadow geometry remain handwritten outside `generated/` and document their source separately.
