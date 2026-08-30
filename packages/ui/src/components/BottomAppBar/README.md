# BottomAppBar architecture contract

Read this file before changing BottomAppBar elevation, container color, or Surface parity.

## AndroidX rendering contract

The pinned AndroidX Material 3 source at `ff9a7111302243197384c499d5e3461c1804cd6e` passes BottomAppBar `tonalElevation` to `Surface`. `Surface` has separate `tonalElevation` and `shadowElevation` parameters, and its `shadowElevation` default is `0.dp`.

Therefore BottomAppBar `ContainerElevation` is **tonal elevation**, not a request for a drop shadow. Do not translate `BottomAppBarTokens.ContainerElevation` or the public `tonalElevation` override into `getElevationBoxShadow()` or `<Elevation>`.

```text
BottomAppBar tonalElevation
        |
        v
Surface tonal background resolution
        |
        +-- container color == surface -> surfaceTint overlay by elevation
        |
        +-- any other container color -> unchanged

Surface shadowElevation = 0 -> box-shadow: none
```

## Default container behavior

The canonical regular BottomAppBar container color aliases `color.role.surfaceContainer`. AndroidX applies a tonal overlay only when the supplied container color is exactly the theme `surface` role. Because the default BottomAppBar color is `surfaceContainer`, its default Level2 tonal elevation does not add another tint and does not paint a shadow.

For an explicit `containerColor="var(--surface)"` override, reuse the shared Surface tonal resolver in `Surface.defaults.ts`. That resolver matches the AndroidX formula:

```text
alpha = ((4.5 * ln(elevationDp + 1)) + 2) / 100
```

Level2 maps to 3dp, giving an 8.238324625039507% `surfaceTint` mix. Custom colors that are not the canonical `surface` role stay unchanged.

## Ownership

- canonical DTCG owns the BottomAppBar semantic container color/elevation tokens;
- `Surface.defaults.ts` owns the shared web adaptation for tonal elevation;
- BottomAppBar runtime chooses regular/flexible elevation and passes the resolved container color through that shared tonal resolver;
- BottomAppBar CSS owns layout, clipping, background, and content paint;
- shared `<Elevation>` is **not** part of BottomAppBar rendering unless a future normative source adds nonzero shadow elevation.

The public `tonalElevation?: ElevationLevel` name remains for API compatibility and must keep tonal semantics.

## Browser contract

Browser/visual tests should expect the regular default BottomAppBar to keep its `surfaceContainer` background and compute `box-shadow: none`, even though the semantic tonal elevation is Level2. FlexibleBottomAppBar uses its pinned Level0 tonal elevation and likewise has no shadow.

Do not restore a root shadow or add an `.elevation` paint layer merely to satisfy an older browser assertion. That assertion encoded the previous web implementation, not the pinned AndroidX contract.

## Forbidden regressions

Do not:

- call `getElevationBoxShadow()` from `BottomAppBar.defaults.ts`;
- render `<Elevation>` for BottomAppBar's tonal elevation;
- treat `tonalElevation` as `shadowElevation`;
- duplicate the Surface tonal overlay formula inside BottomAppBar;
- apply a `surfaceTint` overlay to `surfaceContainer` or arbitrary custom colors;
- replace the canonical `surfaceContainer` role alias with a concrete runtime color.

## Required validation

Changes to this contract should cover:

1. canonical BottomAppBar token aliasing;
2. unit tests proving default `surfaceContainer` stays unchanged and `surface` receives the Level2 tonal overlay;
3. architecture guards rejecting the legacy shadow serializer;
4. browser checks proving the default regular and flexible bars compute `box-shadow: none`;
5. normal UI test/build/typecheck and Material token audits.
