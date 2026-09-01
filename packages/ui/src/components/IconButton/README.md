# IconButton parity notes

Pinned AndroidX revision: `ff9a7111302243197384c499d5e3461c1804cd6e`.

## Upstream sources

Runtime behavior is mapped from:

- `compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/IconButton.kt`

Generated component geometry and colors are projected from the canonical DTCG graph reconciled from the pinned Material 3 sources, including:

- `IconButtonTokens.kt`
- `FilledIconButtonTokens.kt`
- `FilledTonalIconButtonTokens.kt`
- `OutlinedIconButtonTokens.kt`
- `XSmallIconButtonTokens.kt`
- `SmallIconButtonTokens.kt`
- `MediumIconButtonTokens.kt`
- `LargeIconButtonTokens.kt`
- `XLargeIconButtonTokens.kt`

Default rendering consumes generated `@m3-ui/tokens/icon-button.css`; React does not serialize the static size/variant/state matrix. The narrow expressive-shape helper runtime reads generated token exports only because the public `shapes` API needs concrete per-instance shape values.

## Public variants

Action buttons:

- `IconButton`
- `FilledIconButton`
- `FilledTonalIconButton`
- `OutlinedIconButton`

Toggle buttons:

- `IconToggleButton`
- `FilledIconToggleButton`
- `FilledTonalIconToggleButton`
- `OutlinedIconToggleButton`

Action variants use React Aria `Button`. Toggle variants use React Aria `ToggleButton` so keyboard, mouse, touch, `aria-pressed`, controlled `isSelected`, and `onChange` behavior stay owned by the accessibility primitive rather than being recreated in component code.

Icon-only buttons must have an accessible name, normally through `aria-label` or `aria-labelledby`. The visual icon wrapper is `aria-hidden` so an icon implementation cannot accidentally duplicate the button name.

## Geometry and minimum target

The current default maps AndroidX `smallContainerSize()`:

- visual container: 40px × 40px
- icon: 24px
- minimum interactive target: 48px × 48px

The outer semantic button owns the minimum target while the inner visual surface owns Material container geometry, outline, clipping, ripple, and focus shape. Larger expressive sizes naturally exceed 48px.

Five current size families are exposed:

- `extraSmall`: 32px container / 20px icon
- `small`: 40px / 24px
- `medium`: 56px / 24px
- `large`: 96px / 32px
- `extraLarge`: 136px / 40px

`narrow`, `default`, and `wide` widths are derived in generated CSS from the canonical icon size plus the corresponding leading/trailing spacing tokens. The 48px web minimum target is an accessibility/platform mechanic, not a fabricated canonical component token.

## Colors and state layers

Standard, filled, filled-tonal, and outlined action colors map the canonical IconButton token families. Toggle variants resolve selected/unselected container and content colors independently. Generated CSS owns disabled container/content alpha, selected/unselected paint and outlined selection/disabled precedence; React keeps no component color resolver.

Hover, focus, and press feedback is produced by the shared Material Ripple/state-layer primitive. Generated hover/focus/pressed color aliases are not promoted into a second competing component state machine, and IconButton does not duplicate shared Ripple opacity/motion declarations.

## Baseline shapes versus expressive shapes

The ordinary AndroidX overload accepts a single static `shape`. Therefore `shape="round"` and `shape="square"` stay static through press and selection. Generated CSS owns that default size/shape matrix.

Pressed/selected shape morphing is opt-in through the `shapes` prop, matching the expressive AndroidX overloads:

- `iconButtonShapesForSize(size, shape)` provides normal + pressed shapes for action buttons.
- `iconToggleButtonShapesForSize(size, shape)` provides normal + pressed + selected shapes for toggle buttons.
- press takes precedence over selected shape while the press interaction is active.

Only this explicit `shapes` override crosses into TypeScript runtime styling; it emits the active border radius for that instance and user `style` still has final precedence. The CSS approximation uses the canonical FastSpatial motion projection already emitted by `@m3-ui/tokens`; no new motion constants are hardcoded in the component.

## Intentional web differences / remaining gaps

- Compose arbitrary `Shape` implementations map to CSS border-radius values; non-rounded custom path geometry is not reproduced by this API.
- Compose's composition-local content color model maps to CSS `currentColor` on the icon surface.
- The browser minimum target is represented by the semantic button box instead of Compose's `minimumInteractiveComponentSize()` modifier, but normal-flow visual geometry remains separate from the 48px target.
- React Aria owns web interaction semantics. The implementation does not recreate Compose `InteractionSource` as a public web API.
