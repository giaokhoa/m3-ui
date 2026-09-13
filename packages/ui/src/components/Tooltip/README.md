# Tooltip implementation notes

Read this file before changing Tooltip token ownership, elevation rendering, portal inheritance, or interaction semantics.

## Ownership

- React Aria `TooltipTrigger` + `Tooltip` own plain-tooltip hover/focus timing, placement, collision handling, and ARIA tooltip semantics.
- React Aria `PreviewTrigger` + `Popover` own rich-tooltip hover/focus timing, long press, safe-area pointer travel, Tab focus travel, Escape behavior, popup relationships, and non-modal dialog semantics. PreviewTrigger intentionally uses a non-dismissable non-modal Popover, so it does not own Material's click-outside dismissal.
- RichTooltip retains only a narrow `isPersistent` adapter. RAC PreviewTrigger does not expose Material/Compose's persistent mode, so the adapter filters automatic hover/focus close requests. Persistent outside dismissal uses React Aria `useInteractOutside`; Escape and focus restoration remain PreviewTrigger/Popover-owned, and explicit actions close through the RAC overlay state.
- React Aria `OverlayArrow` owns caret coordinates and resolved placement for both plain and rich tooltips. Material only supplies the 16×8 triangle geometry and paint.
- RAC resolves logical `start`/`end` placement from locale direction. The local placement adapter exists only for the public per-component `dir` override, which RAC positioning does not read.
- Canonical Tooltip colors reference `color.role.*`; `ThemeProvider` owns the concrete runtime role values.
- Tooltip shape, typography, geometry, and motion projections remain local until they receive their own reviewed generated component adapter.
- RichTooltip shadow geometry is not a Tooltip runtime projection. The current implementation uses shared Elevation with generated `@m3-ui/tokens/elevation.css` for the canonical shadow recipe.

## RichTooltip elevation

`richTooltipTokens.containerElevation` selects the semantic elevation level. The public `shadowColor` prop is a real runtime override; when absent, the canonical `containerShadowColor` role is used.

Canonical elevation geometry remains compiler-owned rather than being rebuilt in Tooltip TypeScript. Browser tests should validate the semantic elevation level and computed shadow paint rather than require the AriaPopover root itself to own `box-shadow`.

The modular Tooltip stylesheet currently includes both the generated Elevation adapter and handwritten Elevation structural CSS before `tooltip.css`.

## Material and behavior constraints

Preserve Tooltip runtime color roles, RichTooltip semantic elevation, the public `shadowColor` override, React Aria interaction/placement semantics, persistent actionable rich-tooltip behavior, and keyboard/touch access.

Do not recreate hover/focus/Tab/long-press/safe-area algorithms around PreviewTrigger or document-level outside listeners by hand. The only retained outside layer is React Aria `useInteractOutside`, required because PreviewTrigger's non-modal Popover sets `isDismissable: false`. If RAC gains an explicit persistent-preview option with outside dismissal, delete the current adapter rather than layering another state machine over it.
