# Tooltip architecture contract

Read this file before changing Tooltip token ownership, elevation rendering, portal inheritance, or interaction semantics.

## Ownership

- React Aria owns plain-tooltip hover/focus timing, placement, collision handling, and ARIA tooltip semantics.
- RichTooltip keeps its non-modal dialog behavior, portal inheritance, pointer/focus travel, and public runtime overrides in React.
- Canonical Tooltip colors reference `color.role.*`; `ThemeProvider` owns the concrete runtime role values.
- Tooltip shape, typography, geometry, and motion projections remain local until they receive their own reviewed generated component adapter.
- RichTooltip shadow geometry is not a Tooltip runtime projection. The shared `<Elevation>` primitive paints the canonical level through generated `@m3-ui/tokens/elevation.css`.

## RichTooltip elevation

`richTooltipTokens.containerElevation` selects the semantic elevation level. The public `shadowColor` prop is a real runtime override and is passed to `<Elevation>`; when absent, the canonical `containerShadowColor` role is used.

`Tooltip.defaults.ts` must not call `getElevationBoxShadow()` or emit a private Tooltip `box-shadow` token. Browser tests must inspect `.rich-tooltip__elevation`, the actual paint layer, rather than requiring the AriaPopover root to own `box-shadow`.

The modular Tooltip stylesheet must include both the generated Elevation adapter and the handwritten Elevation structural CSS before `tooltip.css`.

## Forbidden regressions

Do not:

- copy `var(--role)` strings into canonical Tooltip color tokens when a `color.role.*` alias exists;
- rebuild canonical elevation shadow layers in Tooltip TypeScript;
- move RichTooltip placement, focus travel, or portal behavior into the Elevation primitive;
- make the interactive/popover root own shadow geometry merely to satisfy a test;
- drop the public `shadowColor` runtime override while migrating static rendering;
- change Tooltip geometry or placement as part of an elevation/token refactor.

When this boundary changes, update this README and its executable architecture guard in the same PR.
