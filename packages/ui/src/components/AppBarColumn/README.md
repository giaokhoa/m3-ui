# AppBarColumn parity notes

## Sources

- AndroidX Compose Material3 revision: `ff9a7111302243197384c499d5e3461c1804cd6e`.
- Reviewed upstream files:
  - `compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/AppBarColumn.kt`
  - `compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/AppBarDsl.kt`
  - `compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/AppBarRow.kt`
- Material Web audit/reference revision: `cac97678831d48d4eb4a606ca50f92673a1dc20c`.
- Canonical repo token input remains `packages/tokens/tokens/**/*.json`; upstream source pins are audit/parity references only.

## Shared architecture

`AppBarColumn` intentionally reuses the public `AppBarAction` model from `AppBarRow`. Built-in inline action/toggle rendering, overflow menu item mapping, default overflow icon, activation behavior, and item identity live in the shared internal AppBar layer. Row and Column layout adapters both delegate to one orientation-agnostic main-axis overflow resolver.

## Supported behavior

- top-to-bottom source-order inline layout;
- height-driven overflow with the overflow trigger reserved only when needed;
- `maxItemCount` where the trigger consumes one slot when overflow exists;
- action, toggle, disabled, and custom items;
- custom overflow trigger render prop shared with `AppBarRow`;
- `ResizeObserver` remeasurement for container/item/trigger size changes;
- existing `Menu`, `IconButton`, and `Tooltip` semantics and focus behavior;
- RTL changes horizontal logical alignment without reversing vertical item order.

## Intentional web adaptation

Compose's `MultiContentMeasurePolicy`, `Modifier`, `AppBarMenuState`, and DSL scopes are not exposed. React uses a controlled item array, DOM `ResizeObserver` measurement, normal flex-column flow, and the repository's React Aria-backed Menu/Tooltip primitives. No duplicate interactive measurement tree is rendered.
