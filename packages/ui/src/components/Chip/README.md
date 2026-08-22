# Chip parity notes

Pinned AndroidX revision: `160825094a81825468a95b115bfb1b541e549856`.

## Upstream sources

- `compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/Chip.kt`
- `compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/AssistChipTokens.kt`
- `compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/FilterChipTokens.kt`
- `compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/InputChipTokens.kt`
- `compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/SuggestionChipTokens.kt`
- `compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/ChipsTokens.kt`
- `compose/material3/material3/src/androidDeviceTest/kotlin/androidx/compose/material3/ChipTest.kt`
- `compose/material3/material3/src/androidDeviceTest/kotlin/androidx/compose/material3/ChipScreenshotTest.kt`

## Public variants

- `AssistChip`
- `ElevatedAssistChip`
- `FilterChip`
- `ElevatedFilterChip`
- `InputChip`
- `SuggestionChip`
- `ElevatedSuggestionChip`

Assist and Suggestion chips use React Aria Button semantics. Filter and Input chips use React Aria Checkbox semantics because AndroidX `SelectableChip` explicitly sets `Role.Checkbox`; using a toggle-button/`aria-pressed` mapping would change the accessibility contract.

## Geometry

AndroidX tests the chip's normal layout height and expanded touch bounds separately. The web mapping keeps the semantic element and visible surface at 32px while an absolutely positioned generated hit box expands pointer hit-testing to at least 48px without inflating normal-flow layout:

- layout / visible container height: 32px
- expanded pointer target height: 48px
- expanded pointer target width: at least 48px
- baseline container radius: 8px (`CornerSmall`)
- label typography: LabelLarge
- icon size: 18px
- InputChip avatar: 24px, full/circular shape
- standard content padding: 8px horizontal
- InputChip content padding follows `InputChipDefaults.contentPadding`: start is 4px for avatar/no-leading-icon or 8px with a leading icon; end is 8px with a trailing icon or 4px otherwise

## Runtime color behavior

Generated hover/focus/pressed color tokens are not promoted to runtime behavior. `ChipColors` resolves only enabled/disabled and `SelectableChipColors` resolves enabled/disabled × selected/unselected. Hover/focus/press visual feedback comes from the Material ripple/state layer plus elevation/shape behavior.

Flat Assist/Suggestion use transparent containers with 1px `OutlineVariant`; disabled outline/content alpha is applied exactly from the generated tokens. Elevated action chips use `SurfaceContainerLow`, Level1 base elevation and Level2 hover elevation.

Flat Filter/Input use transparent unselected containers, `SecondaryContainer` selected containers, 1px unselected outlines and no selected outline. Elevated Filter uses `SurfaceContainerLow` unselected and `SecondaryContainer` selected. Disabled selected/elevated containers use `OnSurface` at 12%; disabled content uses `OnSurface` at 38%. InputChip applies its disabled 0.38 opacity directly to the avatar box, matching the pinned implementation rather than recoloring arbitrary avatar content.

## Elevation and expressive shapes

Elevation tracks the latest still-active press/hover/focus interaction and uses the shared AndroidX internal elevation motion specs: 120ms incoming, 120ms hover-outgoing, and 150ms other outgoing transitions. Drag elevation tokens are preserved but no artificial public drag state is added without an InteractionSource equivalent.

The Filter/ElevatedFilter/Input `shapes` prop maps the pinned expressive `ChipShapes` overload. Default expressive radii are 12px unselected, full selected, and 8px pressed, animated with the pinned FastSpatial motion. The expressive overload also uses the compact 4px icon spacing rules from AndroidX. Its tonal Filter defaults change the unselected leading icon from `Primary` to `OnSurfaceVariant`; this is preserved rather than treating expressive mode as shape-only.

## Intentional web differences / remaining gaps

- Compose's arbitrary `Shape` objects map to CSS border-radius values; non-rounded custom shape geometry is not one-to-one.
- Public custom `Arrangement.Horizontal` and `PaddingValues` objects are not reproduced. Web callers can still style layout through normal CSS; the Material defaults are pinned and tested.
- AndroidX drag interactions have no synthetic web-only API here.
- Chromium behavior/computed-style tests are used for this port. New binary Chip screenshot goldens should be generated in the Linux devcontainer only after visual review.
