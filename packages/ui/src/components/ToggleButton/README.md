# ToggleButton parity notes

Pinned AndroidX revision: `ff9a7111302243197384c499d5e3461c1804cd6e`.
Material Web reference/audit pin: `cac97678831d48d4eb4a606ca50f92673a1dc20c`.

## Upstream sources

Runtime behavior and defaults are mapped from:

- `compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/ToggleButton.kt`
- shared `Button` defaults/helpers used by that source
- `FilledButtonTokens.kt`
- `ElevatedButtonTokens.kt`
- `TonalButtonTokens.kt`
- `OutlinedButtonTokens.kt`
- `ButtonXSmallTokens.kt`
- `ButtonSmallTokens.kt`
- `ButtonMediumTokens.kt`
- `ButtonLargeTokens.kt`
- `ButtonXLargeTokens.kt`
- `MotionSchemeKeyTokens.FastSpatial`

The canonical repo token build input remains `packages/tokens/tokens/**/*.json` through Style Dictionary. Toggle-specific selected/unselected colors, disabled mappings, effects motion and the AndroidX extra-small icon-spacing adaptation live in `component.toggleButton`; shared Button geometry, expressive shape buckets and outline widths continue to reuse `component.button.size.*` rather than being duplicated.

## Public API and variants

The family is intentionally separate from static `Button` and icon-only `IconToggleButton`:

- `ToggleButton`
- `ElevatedToggleButton`
- `FilledTonalToggleButton`
- `OutlinedToggleButton`

All variants are controlled through `isSelected` and `onChange`, support an optional `startIcon`, and expose the five expressive size buckets: `extraSmall`, `small`, `medium`, `large`, and `extraLarge`.

## Web semantics

AndroidX currently adds checkbox role semantics to its toggleable `Surface`. On the web this implementation intentionally uses React Aria `ToggleButton`, which renders button semantics with `aria-pressed`. This matches the native pressable-toggle model, gives Space/Enter activation, focus management, disabled behavior, and controlled state without recreating those behaviors locally.

## State, shape, and motion

Unchecked buttons use the round container shape. Checked buttons use the AndroidX selected-square shape bucket, while active press takes priority over checked state and uses the pressed shape. Generated ToggleButton CSS resolves those states from existing canonical Button size tokens and RAC `data-selected` / `data-pressed` attributes; React does not serialize a static shape table per render.

Selected/unselected color mappings follow the pinned AndroidX token families and are projected from canonical `component.toggleButton` semantics. Outlined buttons drop the outline while selected and reuse the canonical Button expressive outline widths 1px/1px/1px/2px/3px for extra-small through extra-large when unselected. Elevated state shadows reuse the existing Button elevation resolver and remain runtime because live RAC interaction state selects the shared semantic elevation level.

Shape, color and border transitions use the generated Material effects motion projection. `prefers-reduced-motion: reduce` disables transitions so the final controlled state is applied immediately. There is no local selected-animation state, so rapid controlled toggles cannot leave an animation state machine stuck between values.

## Static/runtime ownership and web adaptations

- Static selected/unselected/disabled paint, selected/pressed/default shape selection, outline width, disabled opacity and effects motion are generated from canonical DTCG into `@m3-ui/tokens/toggle-button.css`.
- The canonical Button size tokens project extra-small icon spacing as 4px while pinned AndroidX `ButtonXSmallTokens.IconLabelSpace` is 8px. `component.toggleButton.size.extraSmall.iconSpacing` records that intentional ToggleButton adaptation as 8px without changing the shared Button token.
- Selected square and pressed shapes reuse canonical `component.button.size.*` shape semantics rather than creating a second ToggleButton shape table.
- CSS `border-radius` represents AndroidX rounded/corner-based shape morphing; arbitrary Compose `Shape` path geometry is not exposed.
- React Aria owns interaction semantics; Kotlin `Modifier`, `InteractionSource`, `Dp`, and companion/default objects are not part of the public API.
- Shared `Elevation` remains the narrow runtime exception because elevated variants select semantic shadow levels from current RAC interaction state.
