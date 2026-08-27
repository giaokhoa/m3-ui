# BottomSheetScaffold parity notes

## Sources

- AndroidX `compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/BottomSheetScaffold.kt`
- AndroidX source revision: `ff9a7111302243197384c499d5e3461c1804cd6e`
- Material Web audit revision: `cac97678831d48d4eb4a606ca50f92673a1dc20c`
- Existing web primitives audited: `BottomSheet/**`, `Scaffold/**`, `Snackbar`, `TopAppBar`, `DragHandle`, `Surface`
- Canonical design tokens remain generated from `packages/tokens/tokens/**/*.json`; this component adds no canonical token overrides.

## Supported behavior

- Standard/persistent sheet coexists with interactive main content; no modal scrim or focus trap.
- Default partially-expanded state with a 56px peek height.
- Controlled or imperative state through the existing `SheetState`; no second state model.
- Partial ↔ Expanded state changes and optional Hidden when the supplied state enables it.
- Swipe can be disabled independently from handle actions and imperative state transitions.
- Custom peek height, max sheet width, sheet/container style colors, and optional/custom drag handle.
- Main content reserves the configured peek height, matching the AndroidX scaffold content padding contract.
- Snackbar host tracks the settled visible sheet edge.
- Resize re-measures BottomSheet geometry, recomputes anchors, and keeps a valid target.
- Nested body and sheet scrolling remain independent; pointer dragging remains scoped to BottomSheet's handle.
- RTL is inherited from the containing document and reduced-motion removes scaffold snackbar offset transitions.

## Intentional web adaptations

AndroidX performs subcomposition and places the sheet/snackbar from pixel offsets in a single layout pass. The web implementation reuses the existing absolute-positioned `BottomSheet` and `Scaffold`; `BottomSheet` accepts an explicit partially-expanded visible height so the scaffold can use AndroidX's `layoutHeight - peekHeight` anchor directly. `SheetState` remains the single behavioral source of truth and swipe enablement is kept separate from the handle button action.

The persistent scaffold does not rewrite `ModalBottomSheet`, add router/app-shell abstractions, create a snackbar queue, or change canonical tokens.
