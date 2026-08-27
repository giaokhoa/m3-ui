# AppBarRow parity notes

`AppBarRow` is the React/TypeScript adaptation of AndroidX Material 3 adaptive app-bar actions.

## Pinned sources

- AndroidX `AppBarRow.kt` and `AppBarDsl.kt` at `ff9a7111302243197384c499d5e3461c1804cd6e`.
- AndroidX current TopAppBar behavior at the same pin is the integration reference.
- Material Web audit pin: `cac97678831d48d4eb4a606ca50f92673a1dc20c`.
- Canonical design tokens remain `packages/tokens/tokens/**/*.json` through Style Dictionary. AppBarRow adds no canonical tokens; it reuses `IconButton`, `Tooltip`, and `Menu` styling/tokens.

## Web API adaptation

The Compose DSL is intentionally not exposed. The public API is a data/composition model:

- `items: AppBarAction[]` with `action | toggle | custom` discriminants.
- action/toggle items provide label, icon, disabled state and callbacks.
- custom items provide explicit `renderInline` and `renderOverflow` renderers.
- `maxItemCount` counts the overflow trigger when overflow exists.
- `overflowTrigger` can replace the default accessible icon button.

## Overflow and measurement contract

Items are always considered in logical source order. If every item fits, no overflow slot is reserved. If width or `maxItemCount` overflows, one trigger slot is reserved and only the largest fitting source-order prefix remains inline; the suffix moves to the existing `Menu` primitive.

The implementation uses `ResizeObserver` and measures only the live inline DOM. It never renders hidden duplicate interactive controls, so IDs, focus ownership and accessibility relations stay singular. Widths measured before an item enters overflow are cached so narrow-to-wide resizing can restore source-order items without reordering.

## Intentional web differences

- React Aria `Menu` owns popover placement, keyboard navigation, dismissal, outside interaction and focus restoration rather than porting Compose popup/focus machinery.
- Inline built-in icon actions use the repository `Tooltip` convention and existing `IconButton`/`IconToggleButton` primitives.
- RTL uses CSS logical layout and React Aria logical placement; DOM/source order is never reversed.
- This component does not implement `AppBarColumn`, a generic toolbar framework, command palette behavior, or a `TopAppBar` rewrite.
