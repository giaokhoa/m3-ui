# RadioButton parity notes

`RadioButton` ports the Material 3 Compose radio control to React Aria Components. `RadioGroup` is the web semantic companion that owns mutually-exclusive selection, keyboard navigation, form naming and validation.

## Pinned AndroidX baseline

- Repository: `https://android.googlesource.com/platform/frameworks/support`
- Revision: `160825094a81825468a95b115bfb1b541e549856`
- Material3 module root: `compose/material3/material3`

### Source files

- `src/commonMain/kotlin/androidx/compose/material3/RadioButton.kt`
- `src/commonMain/kotlin/androidx/compose/material3/tokens/RadioButtonTokens.kt`
- `src/commonMain/kotlin/androidx/compose/material3/tokens/MotionSchemeKeyTokens.kt`
- `src/androidDeviceTest/kotlin/androidx/compose/material3/RadioButtonTest.kt`
- `src/androidDeviceTest/kotlin/androidx/compose/material3/RadioButtonScreenshotTest.kt`
- `samples/src/main/java/androidx/compose/material3/samples/RadioButtonSamples.kt`

## Ported runtime contract

- 48px minimum interactive target for an interactive radio;
- 40px state layer;
- 20px radio icon with 2px stroke;
- 2px padding around the Compose canvas icon geometry;
- 12px upstream dot-size constant, producing a 10px visible filled dot after the Compose stroke adjustment;
- selected control color `Primary`;
- unselected control color `OnSurfaceVariant`;
- disabled selected and unselected control color `OnSurface` at 38%;
- `DefaultEffects` motion for enabled control-color changes, sampled to about 166ms for CSS;
- `FastSpatial` motion for selected/unselected dot radius, sampled to about 137ms for CSS;
- disabled color changes snap, while selected/unselected dot motion continues to use `FastSpatial` even when disabled;
- unbounded ripple radius 20px, with hover/focus/press opacity supplied by the shared Material state-layer primitive;
- ripple color follows ambient content color. Compose calls `ripple(...)` without an explicit color, so Material resolves `Color.Unspecified` from `LocalContentColor`; the web port maps this to CSS `currentColor` rather than selection-specific generated icon tokens.

Generated hover/focus/pressed **icon** color tokens are not used to mutate either the control color or ripple color because the pinned Compose runtime does not consume them in `RadioButtonColors` or pass them to `ripple()`.

## Web semantic translations

- A `RadioButton` is backed by React Aria `Radio` and is intended to be used inside this package's `RadioGroup`.
- `RadioGroup` owns the native/WAI-ARIA single-selection model, arrow-key navigation, controlled/uncontrolled value, form `name`, required state and validation. Compose has no dedicated Material `RadioGroup` component; its sample uses `Modifier.selectableGroup()`.
- Radio label content is exposed as `children`; this intentionally collapses the Compose sample's selectable `Row` + visual-only `RadioButton` + adjacent `Text` into one web radio semantic and one clickable label surface.
- The native React Aria input remains the semantic source of truth; Material circles, dot and ripple are presentation-only.
- Hover/focus state layers come from React Aria render state; only the press ripple wave requires event forwarding to the shared ripple primitive.

## Known parity gaps / intentional differences

These are not currently treated as bugs, but they are not exact Compose API/runtime equivalents:

- Compose supports `onClick = null`. In that mode it removes the radio's own selectable semantics, minimum-interactive modifier and ripple, leaving a 24dp visual footprint (`2dp + 20dp + 2dp`) for a parent selectable row to own interaction. The RAC-backed `RadioButton` always represents the web radio semantic; `RadioGroup isReadOnly` only prevents selection changes and is **not** an exact replacement for Compose's visual-only mode.
- Because the RAC radio semantic and label share one root, hovering or pressing the label drives the radio control's circular state layer/ripple. Compose's recommended labeled-group sample instead places `selectable` and its indication on the whole Row while the nested `RadioButton(onClick = null)` has no ripple of its own. This is an intentional web interaction translation, not exact Compose indication placement.
- Compose's `minimumInteractiveComponentSize()` is locally configurable. The web port defaults to a fixed 48px slot; user styles can override layout, but there is no public ThemeProvider-level minimum-target setting yet.
- Compose exposes `RadioButtonColors` and `MutableInteractionSource`. The web API relies on ThemeProvider roles, CSS style overrides, RAC render state and event callbacks instead of matching those objects one-for-one.
- Compose motion uses spring specs from the active `MotionScheme`. The web port samples the standard scheme into CSS `linear()` curves and fixed settle durations, so custom/expressive Compose motion schemes are not yet represented dynamically.
- The web component includes label and group error/description styling that Compose's control itself does not own. Those are web form semantics rather than RadioButton visual parity.

Current `androidx-main` has introduced an internal styleable RadioButton path, but the public standard `RadioButton` still uses the same default 20dp icon, 2dp stroke, 12dp dot constant, 40dp state layer, `FastSpatial` dot motion and `DefaultEffects` color motion at the time of this audit.

## Regression coverage

Unit tests lock token/default mappings. Storybook covers selected, unselected, disabled, read-only, horizontal group, control-only and theme-matrix cases. Playwright verifies radio-group selection and arrow-key semantics, visible pointer selection, 48/40/20px geometry, 2px stroke, 10px visible selected dot, Material control-color resolution, ambient-content-color hover layers, disabled color snap with retained dot motion, read-only selection, and accessible control-only names.
