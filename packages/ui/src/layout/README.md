# Material 3 layout foundation

This directory owns Material 3 layout contracts and layout components for the web. It is not a generic CSS utility framework and it does not translate the Compose layout runtime.

## Source ownership

```text
layout/
├─ adaptive/       Material window classes, posture, pane directives, adapted values and state
├─ components/     Material layout components and canonical scaffolds
└─ index.ts        public layout barrel
```

`src/components/` is reserved for Material UI widget families. Screen/pane composition primitives belong in `src/layout/components/`, even when they are re-exported from the package root for API compatibility.

`Scaffold` is owned by `layout/components/Scaffold`. The legacy `src/components/Scaffold` path is only a compatibility source barrel and must not contain implementation or styles. Internal code should import the canonical layout path.

## Upstream layers

Material layout in Compose is split across layers:

- `androidx.compose.foundation.layout`: low-level mechanics such as Box, Row, Column, Flow layouts, FlexBox and Grid.
- `androidx.compose.material3.Scaffold`: Material screen slots and insets.
- `androidx.compose.material3.adaptive`: window adaptive information.
- `androidx.compose.material3.adaptive.layout`: pane directives, pane adaptation, canonical multi-pane scaffolds and pane motion/state.

For the browser, Flexbox, Grid, logical properties and layout-viewport measurement are the native equivalents of the first layer. Public wrappers such as `Box`, `Row` or `Column` should only be added when they provide a stable semantic contract beyond CSS itself.

The Material-specific adaptive contract is different: its breakpoint classes, partition counts, pane gaps, preferred sizes, posture handling, canonical layouts and motion decisions are design behavior. Those are ported and tested here.

## Current parity

The foundation currently ports pinned AndroidX behavior for:

- V2 width size classes: Compact, Medium, Expanded, Large and Extra Large.
- Height size classes: Compact, Medium and Expanded.
- `WindowAdaptiveInfo`-equivalent data and an SSR-safe browser hook.
- `calculatePaneScaffoldDirective` and the dense two-pane-on-medium variant.
- Explicit folding posture and hinge policies without inventing a browser posture API.
- Hide/Reflow/Levitate `calculateThreePaneScaffoldValue` adaptation with destination-history priority.
- `ThreePaneScaffold` measurement and placement: pane priority, absolute/proportional preferred sizes, RTL order, physical hinge partitions and vertical reflow.
- Per-pane outer margins across expanded, reflowed, levitated and transition geometry, including logical RTL resolution and safe-edge constraints without consuming scaffold partition spacers.
- `ListDetailPaneScaffold` with List → Detail → Extra logical order.
- `SupportingPaneScaffold` with Main → Supporting → Extra order and Supporting → Main reflow strategy.
- `PaneExpansionState`: width/proportion overrides, anchors, pointer resize, animated anchor settling and separator semantics.
- Default pane-expansion state persistence keyed by the active two-pane combination whenever a drag handle is provided, matching AndroidX `PaneExpansionStateKeyProvider` behavior without changing caller-owned explicit state.
- Anchored pane-expansion accessibility semantics: pinned anchor descriptions, current split state, next-anchor action text and animated semantic activation while preserving the browser separator/drag contract.
- Pane-expansion drag-handle edge geometry: minimum interactive target preservation when the split reaches a clipped scaffold edge, including partition-spacer center clamping and target-width expansion.
- `DragToResizeState`: levitated Top/Bottom/Start/End resizing, RTL direction, min/max constraints and AndroidX state cycling.
- Levitated drag-to-resize accessibility semantics for both explicit handles and no-handle panes: current state, next action text, keyboard/assistive activation and whole-pane pointer resize behavior without replacing the pane landmark.
- Levitated pane alignment, scrim behavior, interaction blocking and resizable dialog/sheet placement.
- Pane-motion decision logic, including the complete AndroidX 8 × 8 visibility matrix, modal enter/exit and pure slide/expand/shrink geometry helpers.
- Seekable `ThreePaneScaffoldState`, raw transition progress, pinned spring sampling, bounds interpolation, modal/scrim motion and mid-transition retarget continuity.
- Predictive-back graphics scaling with the pinned AndroidX decay curve while layout measurement remains in unscaled scaffold coordinates.
- `AnimatedPane` visual wrapping: pane-local shape clipping plus levitated-only shadow behavior. CSS border radius is the browser shape equivalent; the AndroidX 15dp platform shadow is represented by a semantic-color CSS shadow because the browser has no platform elevation primitive.
- Pane-local state retention across Hidden ↔ visible changes. AndroidX uses a pane-role `SaveableStateProvider`; the current React 19.2 runtime uses a role-keyed `Activity`, which hides the pane with `display: none`, restores its React/DOM state when visible again, and cleans up Effects while hidden.
- Pane accessibility boundaries. AndroidX marks interactable panes as traversal groups with role-specific pane titles; the browser exposes those panes as named `region` landmarks, keeps them programmatically focusable for destination autofocus, and removes non-interactable pane trees from accessibility and focus with `inert`.
- Material `Scaffold`, implemented with CSS Grid, logical properties and safe-area environment variables.

Immutable layout metrics live in canonical DTCG under `packages/tokens/tokens/core/layout.json`; adaptive code only projects generated `@m3-ui/tokens` values.

## Web mapping rules

Android `dp` layout thresholds map to CSS pixels because both are logical, density-independent layout units. Device pixels are never used for Material window classification.

`useWindowAdaptiveInfo` observes the layout viewport (`document.documentElement`), not `visualViewport`, so virtual keyboards and visual zoom do not incorrectly change the application layout class. Consumers that have reliable fold/hinge information can pass it explicitly as `WindowPosture`.

`ThreePaneScaffold` uses pure measurement/state calculators plus DOM placement. This is intentional: AndroidX pane allocation is not equivalent to equal CSS grid fractions. Each expanded pane starts from its preferred width; surplus width goes to the highest-priority visible pane (Primary → Secondary → Tertiary), while constrained layouts scale preferred widths proportionally. Physical hinge bounds partition the available surface before that allocation.

Preferred pane sizes keep the existing CSS-pixel `number` form and add `preferredPaneSizeProportion(0..1)` in the same per-role width/height slot, matching the two AndroidX `preferredWidth` / `preferredHeight` overloads without creating competing web props. A proportion is resolved against the full scaffold width or height first; partition spacers, priority surplus allocation and constrained scaling are applied afterwards. The same resolver feeds expanded/reflowed layout, levitated placement and transition endpoints so proportional geometry cannot diverge between static and animated states.

`PaneMargins` is applied to measured pane bounds rather than as CSS `margin`. Fixed inline margins are logical CSS-pixel geometry and resolve through the scaffold direction; optional scaffold-local inset bounds represent the safe edges supplied by AndroidX ruler inputs. The clamp happens after pane allocation/reflow, so an existing horizontal or vertical partition spacer is preserved. When an outer pane edge violates a margin, the pane is remeasured smaller against that edge instead of being translated to preserve its previous size. The same post-margin geometry feeds static expanded/reflowed placement, levitated placement and transition endpoints; no Compose `Modifier` abstraction is recreated in the browser API.

Default pane-expansion state follows AndroidX ownership rather than treating every two-pane layout as one global split. Without a drag handle the renderer keeps one cheap stub state. When a drag handle is present and the caller has not supplied `paneExpansionState`, the renderer caches independent default states for Primary + Secondary, Primary + Tertiary, and Secondary + Tertiary so a user-adjusted split is restored when that pair returns. A caller-provided `paneExpansionState` always bypasses this cache and remains explicitly shared/owned by the caller.

Pane-expansion accessibility stays on the browser-native `separator` role. AndroidX exposes the current anchor as state description and an accessibility `onClick` action for the next anchor. The web maps the current anchored split to `aria-valuetext`, the next-anchor action label to `aria-description`, and semantic activation to Enter/Space plus synthetic assistive-tech clicks. Real pointer clicks remain part of the drag interaction and do not cycle anchors. `paneExpansionHandleAriaStrings` can override the pinned English anchor/state/action formatters for localization while `paneExpansionHandleAriaLabel` remains the existing accessible-name override.

Pane-expansion anchor motion follows `PaneExpansionState.animateTo`. The browser reuses the pinned Material under-damped spring (`dampingRatio = 0.8`, `stiffness = 380`, visibility threshold `1`) and truncates every animated offset to an integer before layout, matching AndroidX `value.toInt()`. AndroidX first runs the platform `ScrollableDefaults.flingBehavior()` and feeds its leftover velocity into anchor selection and the anchoring spring. That scrolling spline is platform-specific rather than a Material contract, so the browser treats pointer-release velocity as the corresponding leftover velocity; the same 200 px/s direction threshold selects the anchor and the release velocity becomes the spring's initial velocity. Starting a new direct drag aborts an active anchor animation, matching Compose mutator ownership.

Pane-expansion handle placement keeps the split coordinate separate from the hit-target coordinate. AndroidX clamps the measured handle center to at least half the horizontal partition spacer from the scaffold edge, then expands the handle's minimum measured width when clipping would otherwise reduce the remaining interactive area below `minTouchTargetSize`. The browser applies the same geometry to the outer `separator` wrapper while leaving `PaneExpansionState`, pane allocation and ARIA values on the real split offset. `paneExpansionDragHandleMinTouchTargetSize` defaults to 48 CSS pixels, mirroring Material's minimum interactive component size while still allowing the caller to match a custom Compose handle contract.

Levitated drag-to-resize accessibility follows AndroidX `clickToResize` without sacrificing the browser pane landmark. With an explicit visual drag handle, the existing browser `button` handle exposes the current state (`expanded`, `collapsed`, or `partially expanded`) plus the next transition (`collapse`, `partially expand`, or `expand`) in `aria-description`. When no visual handle is supplied, AndroidX attaches `dragToResize` to the whole pane; the browser keeps the named `region` as the pointer drag/click target and adds a native, focus-revealed resize button inside that region for keyboard and assistive-tech activation. Keeping keyboard activation on that native control also prevents Enter/Space from descendant pane controls from bubbling into a resize. Both variants reuse the same `DragToResizeState` cycle and `levitatedPaneDragHandleAriaStrings` localization contract.

Levitated panes are still pane-scaffold state, not generic dialogs. They render inside the scaffold stacking context; a scrim makes underlying pane trees non-interactable, while the current levitated destination remains interactable. This preserves the AndroidX distinction between pane adaptation and modal semantics.

Motion is split at the same conceptual boundary: `adaptive/paneMotion.ts` owns which motion should happen and the geometry needed by it. `ThreePaneScaffold` consumes that contract as the browser renderer; `AnimatedPane` remains a pane-local visual/content wrapper instead of recreating Compose animation scopes in React.

Pane-local state follows the same ownership rule. AndroidX disposes hidden pane composition while `SaveableStateProvider(paneRole)` preserves saveable state. React 19.2 `Activity` is the browser-native analogue used by the current workspace: a static Hidden pane keeps role-keyed UI/internal state and DOM identity, drops out of layout with `display: none`, and has its Effects cleaned up until the pane becomes visible again. Transition frames switch the same Activity back to visible so exit and re-entry reuse the retained subtree instead of mounting a replacement.

Pane semantics follow browser-native accessibility primitives instead of emulating Compose semantics nodes. AndroidX gives each interactable pane a traversal-group boundary and a localized pane title (`Primary pane`, `Secondary pane`, or `Tertiary pane`). The browser maps that boundary to a named `region` with `tabIndex={-1}`, so destination autofocus lands on an announced pane boundary without adding it to normal tab order. `paneAriaLabels` can override the pinned English defaults for application localization. Hidden panes and panes blocked by a levitated scrim stay `inert`, which removes both the boundary and its descendants from focus and the accessibility tree.

Predictive-back progress is an explicit state input. The browser renderer applies the active AndroidX scale curve to the scaffold graphics layer and removes that known scale from DOM measurement so layout does not feed back into itself. A dedicated cancellation return spring is intentionally not fabricated unless a browser navigation integration exposes a real cancellation lifecycle that needs it.

Layout components should prefer CSS Grid/Flexbox and logical properties over JavaScript measurement whenever the browser can express the Material contract natively. JavaScript measurement is used only where AndroidX itself applies a measurement algorithm that CSS cannot reproduce exactly from static declarations.

## Deliberate next slices

The major adaptive pane-layout, preferred-size, pane-margin, motion, predictive-back, `AnimatedPane` visual, pane-state-retention, pane-expansion persistence/semantics/settling/handle-target, pane-boundary semantics and levitated resize semantics contracts are now represented. Further work should be driven by concrete parity gaps found by upstream audits, browser contracts or application integration rather than by mechanically translating more Compose runtime primitives.

Generic `Box`/`Row`/`Column` wrappers remain deferred until they demonstrate semantic/API value beyond native CSS Flexbox/Grid.
