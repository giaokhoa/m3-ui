# Dialog architecture contract

Read this file before changing Dialog token ownership, surface layering, scrolling, elevation rendering, or React Aria modal semantics.

## Ownership

- Canonical Dialog colors reference `color.role.*`; `ThemeProvider` owns concrete runtime role values.
- Dialog container elevation remains canonical `level3`; generated `@m3-ui/tokens/elevation.css` serializes immutable shadow geometry and shared `<Elevation>` paints it.
- `.dialog-surface` is the non-clipping paint boundary and contains sibling `<Elevation>` and inner React Aria Dialog layers.
- `.dialog` remains the `AriaDialog` semantic and scroll surface and owns `overflow: auto`.
- Elevation must stay outside that clipped scroll surface.
- Public `shadowColor` remains a runtime override forwarded directly to `<Elevation>`.
- `getDialogStyle()` owns renderer geometry, colors, shape and typography overrides, but not canonical shadow serialization.
- Dialog action hover/focus/press mappings remain runtime behavior.

## Rendering contract

The outer `.dialog-surface` wrapper is non-semantic. Focus trapping, Escape handling, outside dismissal, portal placement and focus restoration remain React Aria-owned.

Component-internal wrapper, positioning, overflow and layout changes are allowed when required by this rendering boundary. The separate shared UI layout workstream is outside this component migration.

Browser/visual tests inspect the direct `<Elevation>` paint layer rather than requiring `.dialog` itself to own `box-shadow`.

The modular Dialog stylesheet includes both the generated Elevation adapter and handwritten Elevation structural CSS before `dialog.css`.

## Forbidden regressions

Do not reintroduce direct runtime-role strings into canonical Dialog colors when aliases exist; do not call `getElevationBoxShadow()` from `Dialog.defaults.ts` or emit `--_dialog-box-shadow`; do not put Elevation inside the clipped `.dialog` scroll surface; do not move React Aria dialog semantics onto `.dialog-surface`; and do not drop the public `shadowColor` runtime override.

When this boundary changes, update this README and its executable architecture guard in the same PR.
