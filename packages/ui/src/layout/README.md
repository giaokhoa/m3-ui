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
- `ThreePaneScaffold` measurement and placement: pane priority, preferred sizes, RTL order, physical hinge partitions and vertical reflow.
- `ListDetailPaneScaffold` with List → Detail → Extra logical order.
- `SupportingPaneScaffold` with Main → Supporting → Extra order and Supporting → Main reflow strategy.
- `PaneExpansionState`: width/proportion overrides, anchors, pointer resize and separator semantics.
- `DragToResizeState`: levitated Top/Bottom/Start/End resizing, RTL direction, min/max constraints and AndroidX state cycling.
- Levitated pane alignment, scrim behavior, interaction blocking and resizable dialog/sheet placement.
- Pane-motion decision logic, including the complete AndroidX 8 × 8 visibility matrix, modal enter/exit and pure slide/expand/shrink geometry helpers.
- Material `Scaffold`, implemented with CSS Grid, logical properties and safe-area environment variables.

Immutable layout metrics live in canonical DTCG under `packages/tokens/tokens/core/layout.json`; adaptive code only projects generated `@m3-ui/tokens` values.

## Web mapping rules

Android `dp` layout thresholds map to CSS pixels because both are logical, density-independent layout units. Device pixels are never used for Material window classification.

`useWindowAdaptiveInfo` observes the layout viewport (`document.documentElement`), not `visualViewport`, so virtual keyboards and visual zoom do not incorrectly change the application layout class. Consumers that have reliable fold/hinge information can pass it explicitly as `WindowPosture`.

`ThreePaneScaffold` uses pure measurement/state calculators plus DOM placement. This is intentional: AndroidX pane allocation is not equivalent to equal CSS grid fractions. Each expanded pane starts from its preferred width; surplus width goes to the highest-priority visible pane (Primary → Secondary → Tertiary), while constrained layouts scale preferred widths proportionally. Physical hinge bounds partition the available surface before that allocation.

Levitated panes are still pane-scaffold state, not generic dialogs. They render inside the scaffold stacking context; a scrim makes underlying pane trees non-interactable, while the current levitated destination remains interactable. This preserves the AndroidX distinction between pane adaptation and modal semantics.

Motion is split at the same conceptual boundary: `adaptive/paneMotion.ts` owns which motion should happen and the geometry needed by it. A browser animation renderer must consume that contract rather than re-derive layout decisions inside effects.

Layout components should prefer CSS Grid/Flexbox and logical properties over JavaScript measurement whenever the browser can express the Material contract natively. JavaScript measurement is used only where AndroidX itself applies a measurement algorithm that CSS cannot reproduce exactly from static declarations.

## Deliberate next slices

The next motion slice is the seekable `ThreePaneScaffoldState` / transition renderer boundary: current/target scaffold values, progress, enter/exit visibility, bounds interpolation and spring settling. Predictive-back scaling and the remaining `AnimatedPane` shadow/shape behavior belong after that state/renderer contract is stable.

Generic `Box`/`Row`/`Column` wrappers remain deferred until they demonstrate semantic/API value beyond native CSS Flexbox/Grid.
