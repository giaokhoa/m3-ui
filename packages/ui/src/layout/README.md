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
- `PaneExpansionState`: width/proportion overrides, anchors, pointer resize, animated anchor settling and drag-handle semantics.
- Default pane-expansion state persistence keyed by the active two-pane combination whenever a drag handle is provided, matching AndroidX `PaneExpansionStateKeyProvider` behavior without changing caller-owned explicit state.
- Anchored pane-expansion accessibility semantics: pinned content description, anchor descriptions, current split state, next-anchor action text and animated semantic activation without fabricating an adjustable-range contract that AndroidX does not expose.
- Pane-expansion drag-handle edge geometry: minimum interactive target preservation when the split reaches a clipped scaffold edge, including partition-spacer center clamping and target-width expansion.
- `DragToResizeState`: levitated Top/Bottom/Start/End resizing, RTL direction, min/max constraints and AndroidX state cycling.
- Levitated drag-to-resize accessibility semantics for both explicit handles and no-handle panes: current state, next action text, keyboard/assistive activation and whole-pane pointer resize behavior without replacing the pane landmark.
- Levitated pane alignment, scrim behavior, interaction blocking and resizable dialog/sheet placement.
- Pane-motion decision logic, including the complete AndroidX 8 × 8 visibility matrix, modal enter/exit and pure slide/expand/shrink geometry helpers.
- Seekable `ThreePaneScaffoldState`, raw transition progress, pinned spring sampling, bounds interpolation, modal/scrim motion and mid-transition retarget continuity.
- Predictive-back graphics scaling with the pinned AndroidX decay curve while layout measurement remains in unscaled scaffold coordinates.
- `AnimatedPane` visual wrapping: pane-local shape clipping plus levitated-only shadow behavior. CSS border radius is the browser shape equivalent; the AndroidX 15dp platform shadow is represented by a semantic-color CSS shadow because the browser has no platform elevation primitive.
- Pane-local state retention across Hidden ↔ visible changes. AndroidX disposes hidden composition while a pane-role `SaveableStateProvider` retains saveable state; the React renderer uses role-keyed `Activity` as a runtime lifecycle adaptation, retaining React/DOM state and cleaning up Effects while hidden rather than claiming identical saveable-state semantics.
- Pane accessibility boundaries. AndroidX marks interactable panes as traversal groups with role-specific pane titles; the browser exposes those panes as named `region` landmarks, enters their focusable descendants for destination autofocus using the pinned focus-enter search, and removes non-interactable pane trees from accessibility and focus with `inert`.
- Material `Scaffold`, with full-bounds content geometry, independently layered bars, caller-consumed inner padding, configurable/consumed content insets, safe-area-aware FAB/snackbar placement and logical RTL behavior.

Immutable layout metrics live in canonical DTCG under `packages/tokens/tokens/core/layout.json`; adaptive code only projects generated `@m3-ui/tokens` values.

## Scaffold Compose-to-web mapping

AndroidX Material3 `Scaffold` measures its body against the full scaffold constraints and places it at the scaffold origin. Top and bottom bars live in the same coordinate space; they do not carve rows out of the body. The web `Scaffold` follows that geometry with a one-cell CSS Grid: content, top bar, bottom bar and the floating layer all occupy the same grid area, while bars align to their corresponding block edge.

AndroidX passes a `PaddingValues` object to `content` instead of applying it. The React API preserves that ownership with a render-prop child: `children(innerPadding)`. `innerPadding.top`, `.bottom`, `.start` and `.end` are SSR-safe CSS values backed by scaffold custom properties, and `innerPadding.style` is a convenience mapping for conventional padded content. A caller may ignore them for a map/video/full-bleed surface, apply them only to a scrolling or interactive child, or combine them with application spacing. `Scaffold` never forces those values onto `.scaffold__content`.

`contentWindowInsets` is the browser equivalent of the Compose parameter of the same name. It uses physical `{ top, right, bottom, left }` edges because `env(safe-area-inset-*)` is physical. The browser default maps those edges to safe-area environment variables. Passing zeroes opts into fully edge-to-edge content. When the corresponding bar exists, top/bottom inner padding is the measured bar height; when it is absent, the remaining top/bottom content inset is used, matching Material3's substitution rule. Horizontal inner padding always comes from the remaining horizontal content insets and resolves to logical start/end through CSS direction.

The browser has no ancestor-consumed `WindowInsets` propagation API. `consumedWindowInsets` is therefore explicit: callers pass the physical inset amount an ancestor already consumed. Scaffold subtracts that amount per edge and clamps the result at zero before deriving content, FAB and snackbar offsets. This makes nested inset-aware layouts deterministic and avoids double safe-area padding without inventing an Android runtime abstraction.

Arbitrary React bars can have dynamic height, whereas CSS cannot expose a grid item's measured block size as a reusable custom property. A `ResizeObserver` therefore projects top/bottom bar heights into `--scaffold-top-bar-height` and `--scaffold-bottom-bar-height`. That measurement is limited to the values AndroidX obtains during its layout pass; body geometry itself remains CSS-native and does not depend on JavaScript measurement. Server rendering stays valid because the padding API is expressed as CSS references and bar-height custom properties have zero fallbacks until the browser measures them.

FAB spacing remains 16 CSS pixels, mapping Material dp to browser logical pixels. `start`, `center` and `end` sit above a present bottom bar by that spacing; without a bottom bar they sit above the remaining bottom content inset. `end-overlay` ignores bottom-bar height and uses only the bottom inset, matching the Material overlay semantics. Floating horizontal bounds use the remaining physical content insets but resolve placement through logical start/end, so RTL mirrors start/end while physical safe-area edges remain attached to the correct side. Snackbar and FAB share the same floating stack so a snackbar remains above a present FAB and otherwise uses the bar/inset baseline.

## Web mapping rules

Android `dp` layout thresholds map to CSS pixels because both are logical, density-independent layout units. Device pixels are never used for Material window classification.

`useWindowAdaptiveInfo` observes the layout viewport (`document.documentElement`), not `visualViewport`, so virtual keyboards and visual zoom do not incorrectly change the application layout class. Consumers that have reliable fold/hinge information can pass it explicitly as `WindowPosture`.

`ThreePaneScaffold` uses pure measurement/state calculators plus DOM placement. This is intentional: AndroidX pane allocation is not equivalent to equal CSS grid fractions. Each expanded pane starts from its preferred width; surplus width goes to the highest-priority visible pane (Primary → Secondary → Tertiary), while constrained layouts scale preferred widths proportionally. Physical hinge bounds partition the available surface before that allocation.

Preferred pane sizes keep the existing CSS-pixel `number` form and add `preferredPaneSizeProportion(0..1)` in the same per-role width/height slot, matching the two AndroidX `preferredWidth` / `preferredHeight` overloads without creating competing web props. A proportion is resolved against the full scaffold width or height first; partition spacers, priority surplus allocation and constrained scaling are applied afterwards. The same resolver feeds expanded/reflowed layout, levitated placement and transition endpoints so proportional geometry cannot diverge between static and animated states.

`PaneMargins` is applied to measured pane bounds rather than as CSS `margin`. Fixed inline margins are logical CSS-pixel geometry and resolve through the scaffold direction; optional scaffold-local inset bounds represent the safe edges supplied by AndroidX ruler inputs. The clamp happens after pane allocation/reflow, so an existing horizontal or vertical partition spacer is preserved. When an outer pane edge violates a margin, the pane is remeasured smaller against that edge instead of being translated to preserve its previous size. The same post-margin geometry feeds static expanded/reflowed placement, levitated placement and transition endpoints; no Compose `Modifier` abstraction is recreated in the browser API.

Default pane-expansion state follows AndroidX ownership rather than treating every two-pane layout as one global split. Without a drag handle the renderer keeps one cheap stub state. When a drag handle is present and the caller has not supplied `paneExpansionState`, the renderer caches independent default states for Primary + Secondary, Primary + Tertiary, and Secondary + Tertiary so a user-adjusted split is restored when that pair returns. A caller-provided `paneExpansionState` always bypasses this cache and remains explicitly shared/owned by the caller.

AndroidX pane-expansion drag-handle semantics expose a content description, an optional current-anchor state description and an accessibility `onClick` action labeled with the next anchor. They do not expose an adjustable range. The browser therefore uses a focusable button action surface rather than inventing separator `aria-valuenow` semantics: `paneExpansionHandleAriaLabel` defaults to the pinned `Pane expansion drag handle` content description, while `aria-description` carries the current split and next-anchor text because ARIA has no direct pair equivalent to Compose `stateDescription` plus an `onClick` action label. Enter/Space and synthetic assistive-tech clicks activate the next anchor; real pointer clicks remain part of the drag interaction and do not cycle anchors. `paneExpansionHandleAriaStrings` can override the pinned English anchor/state/action formatters for localization.

Pane-expansion anchor motion follows `PaneExpansionState.animateTo`. The browser reuses the pinned Material under-damped spring (`dampingRatio = 0.8`, `stiffness = 380`, visibility threshold `1`) and truncates every animated offset to an integer before layout, matching AndroidX `value.toInt()`. AndroidX first runs the platform `ScrollableDefaults.flingBehavior()` and feeds its leftover velocity into anchor selection and the anchoring spring. That scrolling spline is platform-specific rather than a Material contract, so the browser treats pointer-release velocity as the corresponding leftover velocity; the same 200 px/s direction threshold selects the anchor and the release velocity becomes the spring's initial velocity. Starting a new direct drag aborts an active anchor animation, matching Compose mutator ownership.

Pane-expansion handle placement keeps the split coordinate separate from the hit-target coordinate. AndroidX clamps the measured handle center to at least half the horizontal partition spacer from the scaffold edge, then expands the handle's minimum measured width when clipping would otherwise reduce the remaining interactive area below `minTouchTargetSize`. The browser applies the same geometry to the outer drag-handle wrapper while leaving `PaneExpansionState` and pane allocation on the real split offset. `paneExpansionDragHandleMinTouchTargetSize` defaults to 48 CSS pixels, mirroring Material's minimum interactive component size while still allowing the caller to match a custom Compose handle contract.

Levitated drag-to-resize accessibility follows AndroidX `clickToResize` without sacrificing the browser pane landmark. AndroidX supplies a state description (`expanded`, `collapsed`, or `partially expanded`) and labels the click action with the next transition (`collapse`, `partially expand`, or `expand`), but does not supply a separate default content description. With an explicit visual drag handle, the browser action surface therefore uses that next-action text as its default accessible name and the current state as `aria-description`; `levitatedPaneDragHandleAriaLabel` remains an optional web override. When no visual handle is supplied, AndroidX attaches `dragToResize` to the whole pane; the browser keeps the named `region` as the pointer drag/click target and adds a native, focus-revealed resize button inside that region for keyboard and assistive-tech activation. Keeping keyboard activation on that native control also prevents Enter/Space from descendant pane controls from bubbling into a resize. Both variants reuse the same `DragToResizeState` cycle and `levitatedPaneDragHandleAriaStrings` localization contract.

Levitated panes are still pane-scaffold state, not generic dialogs. They render inside the scaffold stacking context; a scrim makes underlying pane trees non-interactable, while the current levitated destination remains interactable. This preserves the AndroidX distinction between pane adaptation and modal semantics.

Motion is split at the same conceptual boundary: `adaptive/paneMotion.ts` owns which motion should happen and the geometry needed by it. `ThreePaneScaffold` consumes that contract as the browser renderer; `AnimatedPane` remains a pane-local visual/content wrapper instead of recreating Compose animation scopes in React.

Pane-local state is a runtime mapping rather than an identical Compose lifecycle. AndroidX disposes hidden pane composition while `SaveableStateProvider(paneRole)` preserves saveable state. React 19.2 `Activity` keeps the role-keyed subtree and DOM identity, removes it from layout with `display: none`, and cleans up Effects while hidden. That deliberately preserves React UI state for the web renderer, but it should not be read as a claim that all React state has the same save/restore contract as Compose `rememberSaveable`.

Pane semantics follow browser-native accessibility primitives instead of emulating Compose semantics nodes. AndroidX gives each interactable pane a traversal-group boundary and a localized pane title (`Primary pane`, `Secondary pane`, or `Tertiary pane`). The browser maps that boundary to a named `region`. Destination autofocus does not focus the region wrapper: it requests focus entry and selects a focusable descendant with the pinned Compose Enter→Right spatial search, including Compose's single-child fast path. `paneAriaLabels` can override the pinned English defaults for application localization. Hidden panes and panes blocked by a levitated scrim stay `inert`, which removes both the boundary and its descendants from focus and the accessibility tree.

Predictive-back progress is an explicit state input. The browser renderer applies the active AndroidX scale curve to the scaffold graphics layer and removes that known scale from DOM measurement so layout does not feed back into itself. When predictive-back ends, the last snapped scale returns to `1` with AndroidX `Animatable`'s default critically damped Float spring; a new gesture cancels that return and snaps immediately to the new predictive scale.

Layout components should prefer CSS Grid/Flexbox and logical properties over JavaScript measurement whenever the browser can express the Material contract natively. JavaScript measurement is used only where AndroidX itself applies a measurement algorithm that CSS cannot reproduce exactly from static declarations.

## Deliberate next slices

The major adaptive pane-layout, preferred-size, pane-margin, motion, predictive-back, `AnimatedPane` visual, pane-state-retention, pane-expansion persistence/semantics/settling/handle-target, pane-boundary semantics and levitated resize semantics contracts are now represented. Further work should be driven by concrete parity gaps found by upstream audits, browser contracts or application integration rather than by mechanically translating more Compose runtime primitives.

Generic `Box`/`Row`/`Column` wrappers remain deferred until they demonstrate semantic/API value beyond native CSS Flexbox/Grid.
