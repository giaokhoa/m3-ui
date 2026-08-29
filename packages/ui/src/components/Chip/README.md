# Chip parity notes

Pinned AndroidX revision: `160825094a81825468a95b115bfb1b541e549856`.

## Runtime and token ownership

Assist and Suggestion chips use React Aria Button semantics. Filter and Input chips use React Aria Checkbox semantics because AndroidX `SelectableChip` explicitly sets `Role.Checkbox`.

Chip component color tokens alias canonical `color.role.*` tokens. Only core color-role endpoints contain runtime expressions such as `var(--on-surface)`; Chip canonical files must not duplicate those expressions.

Style Dictionary compiles the immutable enabled/disabled and selected/unselected color/outline matrix into `@m3-ui/tokens/chip.css`. The generated adapter consumes ThemeProvider-owned runtime role variables but does not define them. Handwritten `chip.css` owns structural painting/layout, while React owns only behavior or values that genuinely depend on runtime state or callsite geometry.

`Chip.tokens.ts` and `Chip.defaults.ts` must not decode `var(--role)` into names and reconstruct it, and they must not rebuild static `color-mix(...)` disabled colors. Runtime TypeScript retains interaction ordering, elevation selection/motion, slot-dependent padding/spacing, avatar disabled opacity, and shape overrides/expressive shape morphing.

```text
component.chip.*Color
    -> {color.role.*}
    -> var(--role)
    -> ThemeProvider concrete runtime value
```

## Geometry and Material behavior

The web mapping keeps the semantic element and visible surface at 32px while an absolutely positioned hit box expands pointer hit-testing to at least 48px without inflating normal-flow layout. Baseline container radius is 8px, label typography is LabelLarge, icon size is 18px, and InputChip avatar is 24px with full/circular shape.

Flat Assist/Suggestion use transparent containers with 1px `OutlineVariant`; elevated action chips use `SurfaceContainerLow`, Level1 base elevation and Level2 hover elevation. Flat Filter/Input use transparent unselected containers, `SecondaryContainer` selected containers, 1px unselected outlines and no selected outline. Elevated Filter uses `SurfaceContainerLow` unselected and `SecondaryContainer` selected. Disabled selected/elevated containers use `OnSurface` at 12%; disabled content uses `OnSurface` at 38%.

Elevation tracks the latest still-active press/hover/focus interaction and uses the shared AndroidX internal elevation motion specs: 120ms incoming, 120ms hover-outgoing, and 150ms other outgoing transitions. Drag elevation tokens are preserved but no artificial public drag state is added without an InteractionSource equivalent.

The Filter/ElevatedFilter/Input `shapes` prop maps the pinned expressive `ChipShapes` overload. Default expressive radii are 12px unselected, full selected, and 8px pressed, animated with FastSpatial motion. Expressive mode also uses compact 4px icon spacing; tonal Filter changes the unselected leading icon from `Primary` to `OnSurfaceVariant`.

## Intentional web differences / remaining gaps

- Compose arbitrary `Shape` objects map to CSS border-radius values; non-rounded custom geometry is not one-to-one.
- Public custom `Arrangement.Horizontal` and `PaddingValues` objects are not reproduced.
- AndroidX drag interactions have no synthetic web-only API here.
- Chromium behavior/computed-style tests are used for this port.
