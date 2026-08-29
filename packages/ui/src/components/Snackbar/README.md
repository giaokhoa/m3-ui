# Snackbar architecture contract

Read this file before changing Snackbar token ownership, elevation rendering, action/icon interaction styling, or surface semantics.

## Ownership

- Canonical Snackbar colors reference `color.role.*`; `ThemeProvider` owns the concrete runtime role values.
- The Snackbar container keeps its canonical `level3` as a semantic elevation level. The shared `<Elevation>` primitive paints the static shadow recipe through generated `@m3-ui/tokens/elevation.css`.
- The public `shadowColor` prop remains a real runtime override and is passed to `<Elevation>`; when absent, the canonical `containerShadowColor` role is used.
- `getSnackbarStyle()` owns renderer geometry and runtime surface overrides, but it must not serialize canonical elevation geometry.
- SnackbarAction and SnackbarDismissAction continue to map React Aria hover/focus/press state to Snackbar-specific label/icon and Ripple variables at runtime. Those interaction-dependent action/icon mappings are behavior, not immutable CSS-token projection debt.

## Rendering contract

The Snackbar root remains the layout/surface element. Adding the absolute `.snackbar__elevation` paint layer must not change the 48px/68px container geometry, width cap, flex layout, action-on-new-line spacing, status semantics, or keyboard ordering.

Browser/visual tests must inspect `.snackbar__elevation`, the actual shadow paint layer, rather than requiring the Snackbar root itself to own `box-shadow`.

The modular Snackbar stylesheet must include both the generated Elevation adapter and handwritten Elevation structural CSS before `snackbar.css`.

In forced-colors mode, custom elevation is hidden while the Snackbar surface keeps its system-color border/background affordance.

## Forbidden regressions

Do not:

- copy `var(--role)` strings into canonical Snackbar color tokens when a `color.role.*` alias exists;
- call `getElevationBoxShadow()` from `Snackbar.defaults.ts` or emit `--_snackbar-box-shadow`;
- compile away interaction-dependent action/icon mappings merely because static token CSS exists;
- drop the public `shadowColor` runtime override;
- make the root own shadow geometry just to preserve an old test assertion;
- change Snackbar layout, sizing, queueing policy, or accessibility semantics as part of a token/elevation refactor.

When this boundary changes, update this README and its executable architecture guard in the same PR.
