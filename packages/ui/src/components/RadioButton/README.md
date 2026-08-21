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
- disabled color changes snap, while selected/unselected dot motion continues to use `FastSpatial` even when disabled.

Generated hover/focus/pressed icon-color tokens are not used to mutate the control color because the pinned Compose `RadioButtonDefaults` runtime resolves the control color only from `enabled × selected`. State-layer color still follows the Material interaction roles used by the generated tokens.

## Web semantic translations

- A `RadioButton` is backed by React Aria `Radio` and is intended to be used inside this package's `RadioGroup`.
- `RadioGroup` owns the native/WAI-ARIA single-selection model, arrow-key navigation, controlled/uncontrolled value, form `name`, required state and validation.
- Radio label content is exposed as `children`; this is a web convenience around Compose's documented pattern of composing `RadioButton` with adjacent `Text`.
- The native React Aria input remains the semantic source of truth; Material circles, dot and ripple are presentation-only.
- Compose's `onClick = null` visual-indicator mode maps most closely to a read-only group on the web rather than removing radio semantics from an individual option.
- Hover/focus state layers come from React Aria render state; only the press ripple wave requires event forwarding to the shared ripple primitive.

## Regression coverage

Unit tests lock token/default mappings. Storybook covers selected, unselected, disabled, read-only, horizontal group, control-only and theme-matrix cases. Playwright verifies radio-group selection and arrow-key semantics, 48/40/20px geometry, 2px stroke, 10px visible selected dot, Material color-role resolution, selection-aware hover layers, disabled color snap with retained dot motion, read-only selection, and accessible control-only names.
