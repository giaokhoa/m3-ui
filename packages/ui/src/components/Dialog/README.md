# Dialog implementation notes

Read this file before changing Dialog token ownership, surface layering, scrolling, elevation rendering, or React Aria modal semantics.

## Ownership

- Canonical Dialog colors reference `color.role.*`; `ThemeProvider` owns concrete runtime role values.
- Dialog container elevation remains canonical `level3`; generated `@m3-ui/tokens/elevation.css` serializes immutable shadow geometry and shared `<Elevation>` paints it.
- The current implementation uses `.dialog-surface` as a non-clipping paint boundary around sibling Elevation and inner React Aria Dialog layers.
- `.dialog` remains the `AriaDialog` semantic and scroll surface and owns `overflow: auto`.
- The current paint layer stays outside that clipped scroll surface so the level3 shadow remains visible.
- Public `shadowColor` remains a runtime override forwarded to Elevation.
- `getDialogStyle()` owns renderer geometry, colors, shape and typography overrides, but not canonical shadow serialization.
- Dialog action hover/focus/press mappings remain runtime behavior.

## Current rendering

The outer `.dialog-surface` wrapper is non-semantic. Focus trapping, Escape handling, outside dismissal, portal placement and focus restoration remain React Aria-owned.

Component-internal wrapper, positioning, overflow and layout changes are allowed when they preserve the required Material rendering and React Aria behavior. The separate shared UI layout workstream is outside this component migration.

Browser/visual tests validate the semantic elevation level and computed paint rather than requiring `.dialog` itself to own `box-shadow`.

The modular Dialog stylesheet currently includes both the generated Elevation adapter and handwritten Elevation structural CSS before `dialog.css`.

## Material and behavior constraints

Do not reintroduce direct runtime-role strings into canonical Dialog colors when aliases exist, change the canonical level3 elevation, move React Aria dialog semantics onto a decorative wrapper, or drop the public `shadowColor` runtime override.

Implementation details such as wrapper names, exact DOM layering, or how the shared Elevation paint is wired may change when there is a better web implementation. Update these notes when that implementation changes; do not add a source-regex guard solely to freeze the current structure.
