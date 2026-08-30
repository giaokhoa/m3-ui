# BottomSheet architecture contract

Read this file before changing BottomSheet token ownership, elevation painting, sheet geometry, anchors, gestures, or modal lifecycle.

## Elevation semantics

BottomSheet uses **shadow elevation**, not the BottomAppBar tonal-elevation model. AndroidX exposes `sheetShadowElevation` and passes it to the sheet `Surface.shadowElevation`.

The canonical sheet tokens currently map both standard and modal containers to `level1`. Runtime code may select the semantic standard/modal level, but it must not serialize Material shadow geometry in TypeScript.

## Why this component uses elevation host paint

The `.bottom-sheet` root already owns all of these contracts simultaneously:

- `overflow: auto` for the sheet surface;
- the `translate3d(...)` offset used by anchors and drag settling;
- `offsetHeight` / `offsetParent` measurement used to calculate anchors;
- the actual top-only rounded surface.

A descendant `<Elevation>` painter would be clipped by the scrolling root. Adding an outer wrapper solely to paint elevation would change the measured/transformed DOM boundary and risks altering anchor/layout behavior.

Therefore BottomSheet deliberately uses the shared `.elevation-host` mode on the existing root:

```text
class="bottom-sheet elevation-host"
data-elevation="levelN"
```

`@m3-ui/tokens/elevation.css` owns immutable shadow geometry/opacities. `internal/elevation/elevation.css` applies the host `box-shadow`. `ThemeProvider` owns the concrete `--shadow` role.

`BottomSheet.defaults.ts` must not call `getElevationBoxShadow()` or emit `--_bottom-sheet-box-shadow`.

## Runtime override boundary

The public `shadowColor` prop is a genuine runtime override. It may set only `--_elevation-shadow-color` on the existing host root. It must never regenerate the shadow list in React.

`getBottomSheetElevationLevel()` is the single selector for standard versus modal semantic elevation. `getBottomSheetStyle()` owns surface/handle/shape/motion projection and is intentionally independent of shadow serialization.

## Canonical color roles

The BottomSheet canonical token branch uses semantic DTCG aliases:

- docked container → `color.role.surfaceContainerLow`;
- drag handle → `color.role.onSurfaceVariant`;
- focus indicator → `color.role.secondary`.

`ThemeProvider` resolves those role values at runtime. Do not replace these aliases with duplicated `var(--role)` strings or decode runtime CSS values back into semantic names.

## Geometry and interaction ownership

Sheet anchors, measurements, pointer drag state, velocity dampening, settle target selection, hidden/partial/expanded state, modal focus containment, Escape/outside-dismiss lifecycle and transform motion are runtime behavior. Elevation refactors must not change them.

In particular, do not add/remove wrappers around `.bottom-sheet`, change its positioned containing block, or move `sheetRef` to another element as part of token/elevation work.

The shared `packages/ui/src/layout/**` workstream is separate from this component contract and must not be edited as part of BottomSheet elevation/token migration.

## CSS packaging

Source/dev consumers import the generated elevation adapter and shared host paint CSS before `bottom-sheet.css`.

The modular `@m3-ui/ui/styles/BottomSheet.css` entry must inline, in order:

1. `packages/tokens/dist/generated/elevation.css`;
2. `packages/ui/src/internal/elevation/elevation.css`;
3. `packages/ui/src/components/BottomSheet/bottom-sheet.css`.

## Browser contract

BottomSheet intentionally paints elevation on its existing root host. Browser tests should inspect that root and verify the semantic `data-elevation` plus computed `box-shadow`, while preserving the existing 640px width, top-only shape, handle geometry, anchor/drag behavior, motion, scrim and modal focus/dismiss contracts.

## Forbidden regressions

Do not:

- restore `getElevationBoxShadow()` or `--_bottom-sheet-box-shadow`;
- hardcode level shadow geometry/opacities in BottomSheet CSS or TypeScript;
- add a descendant shadow painter inside the scrolling root;
- add a wrapper solely for elevation;
- move measurement, transform, scrolling or anchor ownership to satisfy elevation painting;
- turn `shadowColor` into a shadow-string serializer;
- revert canonical BottomSheet role aliases to direct `var(--role)` strings;
- change sheet geometry, gestures, anchors or modal lifecycle in a token/elevation refactor.
