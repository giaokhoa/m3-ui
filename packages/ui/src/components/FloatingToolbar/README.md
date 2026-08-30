# FloatingToolbar architecture contract

Read this file before changing FloatingToolbar elevation, surface layering, expanded/collapsed behavior, FAB integration, or generated-style dependencies.

## Ownership

- Runtime behavior owns the semantic elevation level. `resolveFloatingToolbarElevation()` selects the level from expanded/collapsed state, FAB presence, and the public `expandedElevation` / `collapsedElevation` overrides.
- The pinned AndroidX renderer behavior used by this component is intentionally `level0` for a standalone toolbar, `level1` for the expanded toolbar part when a FAB is attached, and `level0` for the collapsed toolbar part. Do not replace that runtime mapping with the Web-current `component.toolbar.floating.containerElevation = level3` token as part of a rendering refactor; changing that provenance decision requires an explicit parity review.
- Shared `<Elevation>` owns shadow painting. Generated `@m3-ui/tokens/elevation.css` owns immutable shadow geometry and opacity.
- `.floating-toolbar__surface-shell` is the non-clipping paint boundary and owns the radius inherited by `<Elevation>` and the clipped surface.
- `.floating-toolbar__surface` owns background, content layout, rounded clipping, collapse visibility, and conditional content. It must not own `box-shadow`.
- `getFloatingToolbarStyle()` remains public and keeps its existing call signature for compatibility. It may project geometry, motion, colors, FAB size and user visual overrides, but it must not serialize elevation geometry.
- The toolbar root continues to own hoisted translation state and logical exit-direction behavior. The FAB keeps its own component elevation semantics; this contract only covers the toolbar surface paint layer.

## Rendering contract

The paint layer must remain outside `.floating-toolbar__surface` because that surface uses `overflow: hidden`. Putting `<Elevation>` inside the clipped surface would truncate the Material shadow.

Browser/visual tests inspect `.floating-toolbar__elevation`, the actual paint layer, and verify its semantic `data-elevation` value. They must not require `.floating-toolbar__surface` or the toolbar root to own `box-shadow`.

The modular FloatingToolbar stylesheet must inline generated Elevation CSS and handwritten Elevation structural CSS before `floating-toolbar.css`.

Reduced-motion behavior includes the elevation transition in addition to toolbar translation, surface size, conditional content and FAB size transitions.

## Token provenance

`toolbar-web-current.json` is retained as Web implementation evidence and currently contains a floating-toolbar `level3` declaration plus direct runtime-role strings. Those declarations are not silently promoted over the pinned AndroidX runtime behavior by this migration. Color-role alias cleanup is a separate token-graph slice; React must not decode or reconstruct those role strings.

## Forbidden regressions

Do not call `getElevationBoxShadow()` from `FloatingToolbar.defaults.ts`; do not emit `--_floating-toolbar-box-shadow`; do not move `<Elevation>` inside `.floating-toolbar__surface`; do not make the clipped surface paint its own shadow; and do not replace the runtime semantic-level resolver with static shadow serialization.

When this ownership or layering changes, update this README and its executable architecture guard in the same PR.
