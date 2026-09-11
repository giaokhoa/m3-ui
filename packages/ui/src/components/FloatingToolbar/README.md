# FloatingToolbar implementation notes

Read this file before changing FloatingToolbar elevation, surface layering, expanded/collapsed behavior, FAB integration, or generated-style dependencies.

## Ownership

- Runtime behavior owns the semantic elevation level. `resolveFloatingToolbarElevation()` selects the level from expanded/collapsed state, FAB presence, and the public `expandedElevation` / `collapsedElevation` overrides.
- The pinned AndroidX renderer behavior used by this component is intentionally `level0` for a standalone toolbar, `level1` for the expanded toolbar part when a FAB is attached, and `level0` for the collapsed toolbar part. Do not replace that runtime mapping with the Web-current `component.toolbar.floating.containerElevation = level3` token without an explicit parity review.
- Shared Elevation currently owns shadow painting; generated `@m3-ui/tokens/elevation.css` owns immutable shadow geometry and opacity.
- The current implementation uses `.floating-toolbar__surface-shell` as the non-clipping paint boundary around the Elevation layer and clipped surface.
- `.floating-toolbar__surface` owns background, content layout, rounded clipping, collapse visibility, and conditional content. Its current clipped geometry means the shadow is painted outside it.
- `getFloatingToolbarStyle()` remains public and keeps its existing call signature for compatibility. It may project geometry, motion, colors, FAB size and user visual overrides, but canonical elevation geometry remains compiler-owned.
- The toolbar root continues to own hoisted translation state and logical exit-direction behavior. The FAB keeps its own component elevation semantics; these notes cover the toolbar surface paint only.

## Current rendering

The current paint layer is outside `.floating-toolbar__surface` because that surface uses `overflow: hidden`; placing the same painter inside that clipped surface would truncate the Material shadow.

Browser/visual tests validate the semantic elevation level and computed paint rather than requiring the toolbar surface or root to own `box-shadow`.

The modular FloatingToolbar stylesheet currently inlines generated Elevation CSS and handwritten Elevation structural CSS before `floating-toolbar.css`.

Reduced-motion behavior includes the elevation transition in addition to toolbar translation, surface size, conditional content and FAB size transitions.

## Token provenance

`toolbar-web-current.json` is retained as Web implementation evidence and currently contains a floating-toolbar `level3` declaration plus direct runtime-role strings. Those declarations are not silently promoted over the pinned AndroidX runtime behavior by this migration. Color-role alias cleanup is a separate token-graph slice; React must not decode or reconstruct those role strings.

## Material and behavior constraints

Preserve the reviewed runtime elevation mapping and public elevation overrides unless a parity review changes them. Do not reintroduce runtime serialization of canonical shadow geometry merely to match the current DOM structure.

Wrapper names, exact paint-layer placement, and selector structure are implementation details. Update these notes if that wiring changes while preserving the required Material paint, clipping, motion, and accessibility behavior; do not add a source-regex guard solely to freeze the current structure.
