# Generated Material tokens

Generated token files in this directory come from pinned AndroidX Material3 token sources.

Rules:

1. Do not edit generated files by hand.
2. Output must be deterministic for a pinned source revision.
3. Generated output contains data only: no React, DOM, CSS, or component behavior.
4. Every file must record the upstream revision and source path.
5. Output must be idiomatic TypeScript rather than Kotlin-shaped APIs.

Examples of semantic conversion:

- `ColorSchemeKeyTokens.Primary` -> `'primary'`
- `ElevationTokens.Level1` -> `'level1'`
- `ShapeKeyTokens.CornerFull` -> `'full'`
- `TypographyKeyTokens.LabelLarge` -> `'labelLarge'`
- `18.0.dp` -> `18`

Platform-specific web adaptations such as ripple animation timing or web shadow geometry should remain handwritten modules outside `generated/` and document their source separately.
