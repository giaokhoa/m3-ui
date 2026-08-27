# FloatingActionButtonMenu parity notes

## Source boundary

- AndroidX Compose Material3 source of truth: `FloatingActionButtonMenu.kt` at `ff9a7111302243197384c499d5e3461c1804cd6e`.
- Token references reviewed from that source: `FabMenuBaselineTokens`, `FabBaselineTokens`, `FabMediumTokens`, `FabLargeTokens`, `FabPrimaryContainerTokens`, and `MotionSchemeKeyTokens`.
- Material Web audit/reference revision: `cac97678831d48d4eb4a606ca50f92673a1dc20c`.
- Canonical repo build inputs remain `packages/tokens/tokens/**/*.json` through Style Dictionary. This component does not mutate canonical tokens.

## Supported family

- `FloatingActionButtonMenu`: controlled `expanded` state, trigger relationship, logical start/end alignment, bottom-to-top open stagger, top-to-bottom close stagger, keyboard transfer from trigger, focus restoration on collapse, and scroll-bounded action content.
- `FloatingActionButtonMenuItem`: icon + text action button, disabled semantics, Compose list-item geometry, primary-container defaults, and canonical level-3 Compose elevation.
- `ToggleFloatingActionButton`: controlled checked state, baseline/medium/large initial geometry, morph to the 56px/28px-radius close geometry, color/icon interpolation endpoints, and stable initial interaction bounds.

## Intentional web adaptations

- The action collection is a `role="group"` of button semantics rather than an ARIA `menu`; FAB menu actions are ordinary actions, not application-menu commands with menuitem semantics.
- Compose drives stagger thresholds with a slow-effects integer spring. CSS has no equivalent integer-threshold spring, so the renderer uses the canonical 50ms short duration as a deterministic threshold cadence while retaining FastSpatial/FastEffects projections for each item's transform/alpha transition.
- Item width reveal uses `scaleX` over a stable intrinsic layout width. This preserves the source reveal direction without reflow/layout jumps during rapid open/close.
- The Material Web FAB-menu audit records list-item base elevation `level0`, while the pinned Compose source/canonical semantic remains `level3`. This renderer follows the Compose source of truth and leaves `packages/tokens/audit/material-web-fab-menu-drift.json` as drift evidence.
- `prefers-reduced-motion: reduce` removes stagger/morph durations and delays while preserving expanded state, checked state, focus transfer, and focus restoration.
