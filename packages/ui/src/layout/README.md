# Material 3 layout foundation

This directory owns Material 3 adaptive layout contracts for the web. It is not a generic CSS utility framework and it does not translate the Compose layout runtime.

## Upstream layers

Material layout in Compose is split across layers:

- `androidx.compose.foundation.layout`: low-level mechanics such as Box, Row, Column, Flow layouts, FlexBox and Grid.
- `androidx.compose.material3.Scaffold`: Material screen slots and insets.
- `androidx.compose.material3.adaptive`: window adaptive information.
- `androidx.compose.material3.adaptive.layout`: pane directives and canonical multi-pane scaffolds.

For the browser, Flexbox, Grid, logical properties and container/layout viewport measurement are the native equivalents of the first layer. Public wrappers should only be added when they provide a stable semantic contract beyond CSS itself.

The Material-specific adaptive contract is different: its breakpoint classes, partition counts, pane gaps, preferred sizes, posture handling and canonical layouts are design decisions. Those are ported and tested here.

## Current parity slice

The first slice ports the pinned AndroidX behavior for:

- V2 width size classes: Compact, Medium, Expanded, Large and Extra Large.
- Height size classes: Compact, Medium and Expanded.
- `WindowAdaptiveInfo`-equivalent data and an SSR-safe browser hook.
- `calculatePaneScaffoldDirective`.
- `calculatePaneScaffoldDirectiveWithTwoPanesOnMediumWidth`.
- Explicit folding posture and hinge policies without inventing a browser posture API.

Immutable layout metrics live in canonical DTCG under `packages/tokens/tokens/core/layout.json`; this code only projects generated `@m3-ui/tokens` values.

## Web mapping rules

Android `dp` layout thresholds map to CSS pixels because both are logical, density-independent layout units. Device pixels are never used for Material window classification.

`useWindowAdaptiveInfo` observes the layout viewport (`document.documentElement`), not `visualViewport`, so virtual keyboards and visual zoom do not incorrectly change the application layout class. Consumers that have reliable fold/hinge information can pass it explicitly as `WindowPosture`.

## Next layer

Canonical `ThreePaneScaffold`, `ListDetailPaneScaffold` and `SupportingPaneScaffold` should consume `PaneScaffoldDirective`. Their pane placement should use CSS Grid and logical properties, preserving RTL and excluded-bound behavior without porting Compose measurement policies or `Modifier`.
