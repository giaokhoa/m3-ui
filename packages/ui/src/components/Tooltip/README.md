# Tooltip implementation notes

Read this file before changing Tooltip token ownership, elevation rendering, portal inheritance, or interaction semantics.

## Ownership

- React Aria owns plain-tooltip hover/focus timing, placement, collision handling, and ARIA tooltip semantics.
- RichTooltip keeps its non-modal dialog behavior, portal inheritance, pointer/focus travel, and public runtime overrides in React.
- Canonical Tooltip colors reference `color.role.*`; `ThemeProvider` owns the concrete runtime role values.
- Tooltip shape, typography, geometry, and motion projections remain local until they receive their own reviewed generated component adapter.
- RichTooltip shadow geometry is not a Tooltip runtime projection. The current implementation uses shared Elevation with generated `@m3-ui/tokens/elevation.css` for the canonical shadow recipe.

## RichTooltip elevation

`richTooltipTokens.containerElevation` selects the semantic elevation level. The public `shadowColor` prop is a real runtime override; when absent, the canonical `containerShadowColor` role is used.

Canonical elevation geometry remains compiler-owned rather than being rebuilt in Tooltip TypeScript. Browser tests should validate the semantic elevation level and computed shadow paint rather than require the AriaPopover root itself to own `box-shadow`.

The modular Tooltip stylesheet currently includes both the generated Elevation adapter and handwritten Elevation structural CSS before `tooltip.css`.

## Material and behavior constraints

Preserve Tooltip runtime color roles, RichTooltip semantic elevation, the public `shadowColor` override, React Aria placement/interaction semantics, and focus/pointer travel behavior.

Do not move Tooltip interaction behavior into the Elevation primitive or rebuild canonical shadow layers merely to preserve a particular DOM/test structure. Paint-layer placement and selector structure may change when the resulting Material rendering and behavior remain correct; update these notes rather than adding a source-regex guard for the current implementation.
