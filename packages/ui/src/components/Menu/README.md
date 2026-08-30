# Menu implementation notes

Read this file before changing Menu surface layering, elevation rendering, clipping, overlay positioning, theme portal ownership, or React Aria menu semantics.

## Ownership

- React Aria `Popover` remains the positioning, flip/shift, dismissal and focus-restoration boundary.
- `ThemeProvider` owns concrete runtime color roles. Standard `Menu` and `ExposedMenu` must remain inside the provider's theme portal scope so portaled surfaces inherit `--surface-*`, `--shadow`, and the other runtime roles from `[data-m3-theme-portal]`.
- Menu's canonical container elevation remains `level2`. Generated `@m3-ui/tokens/elevation.css` serializes immutable shadow geometry and the current implementation uses shared Elevation to paint it.
- The current implementation uses `.menu-surface` as a non-clipping paint boundary and `.menu-surface__clip` for rounded clipping/background.
- `.menu` remains the React Aria menu and scroll surface; long-menu overflow stays on the semantic menu.
- `getMenuStyle()` may project renderer geometry and existing token values into private CSS variables, but canonical elevation geometry remains compiler-owned.
- Existing canonical Menu color-role strings are migration debt in the large upstream-derived token family; do not decode/rebuild them in React and do not add new direct runtime-role strings while that debt is migrated separately.

## Current rendering

Standard `Menu` and `ExposedMenu` currently share the same paint/clip surface implementation. The positioned Popover remains non-clipping so the outer level2 shadow is visible.

A portaled Menu that escapes the active ThemeProvider scope is a runtime-color bug even if its geometry and React Aria interactions still work. Browser tests should validate resulting theme inheritance and computed rendering rather than freeze the exact portal helper, wrapper class, or DOM shape.

Component-internal wrappers and CSS layout may change when they preserve Material rendering, runtime color inheritance, clipping, and React Aria semantics.

Browser/visual tests validate the semantic elevation level and computed paint rather than requiring `.menu-popover` itself to own `box-shadow`.

The modular Menu stylesheet currently includes generated Elevation CSS and handwritten Elevation structural CSS before `menu.css`.

## Material and behavior constraints

Preserve canonical level2 elevation, ThemeProvider runtime-role inheritance, React Aria menu/Popover behavior, and correct rounded clipping. Do not reintroduce runtime serialization of canonical shadow geometry merely to preserve the current implementation.

Exact wrapper names, shared-surface helper choice, and paint-layer placement are implementation details. Update these notes if that wiring changes; do not add a source-regex guard solely to freeze the current structure.
