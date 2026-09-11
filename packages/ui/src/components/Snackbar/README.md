# Snackbar implementation notes

Read this file before changing Snackbar token ownership, elevation rendering, action/icon interaction styling, or surface semantics.

## Ownership

- Canonical Snackbar colors reference `color.role.*`; `ThemeProvider` owns the concrete runtime role values.
- The Snackbar container keeps its canonical `level3` as a semantic elevation level. The current implementation uses shared Elevation with generated `@m3-ui/tokens/elevation.css` for the shadow recipe.
- The public `shadowColor` prop remains a real runtime override; when absent, the canonical `containerShadowColor` role is used.
- `getSnackbarStyle()` owns renderer geometry and runtime surface overrides, while canonical elevation geometry remains compiler-owned.
- SnackbarAction and SnackbarDismissAction continue to map React Aria hover/focus/press state to Snackbar-specific label/icon and Ripple variables at runtime. Those interaction-dependent mappings are behavior, not immutable CSS-token projection debt.

## Current rendering

The Snackbar root remains the layout/surface element. The current absolute Elevation paint layer does not change the 48px/68px container geometry, width cap, flex layout, action-on-new-line spacing, status semantics, or keyboard ordering.

Browser/visual tests validate canonical level3 and computed shadow paint rather than requiring the Snackbar root itself to own `box-shadow`.

The modular Snackbar stylesheet currently includes both the generated Elevation adapter and handwritten Elevation structural CSS before `snackbar.css`.

In forced-colors mode, custom elevation is hidden while the Snackbar surface keeps its system-color border/background affordance.

## Material and behavior constraints

Preserve canonical level3 elevation, runtime color-role semantics, the public `shadowColor` override, interaction-dependent action/icon behavior, Snackbar geometry, queueing behavior, and accessibility semantics.

Do not reintroduce runtime serialization of canonical shadow geometry merely to preserve the current DOM or test locator. Paint-layer placement and selector structure may change when the resulting Material rendering and behavior remain correct; update these notes rather than adding a source-regex guard for the current implementation.
