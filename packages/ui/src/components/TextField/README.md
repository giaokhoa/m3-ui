# TextField parity notes

`TextField` and `OutlinedTextField` are web ports of the Material 3 filled and outlined text-field families. The target is behavioral and visual parity with Jetpack Compose where the behavior has a meaningful DOM equivalent, while native HTML and React Aria Components own web semantics.

## Pinned AndroidX baseline

- Repository: `https://android.googlesource.com/platform/frameworks/support`
- Revision: `160825094a81825468a95b115bfb1b541e549856`
- Material3 module root: `compose/material3/material3`

The revision is intentionally pinned rather than following `androidx-main`. Upstream changes must be adopted explicitly and reviewed as parity drift.

### Source files

- `src/commonMain/kotlin/androidx/compose/material3/TextField.kt`
- `src/commonMain/kotlin/androidx/compose/material3/TextFieldDefaults.kt`
- `src/commonMain/kotlin/androidx/compose/material3/OutlinedTextField.kt`
- `src/commonMain/kotlin/androidx/compose/material3/internal/TextFieldImpl.kt`
- `src/commonMain/kotlin/androidx/compose/material3/tokens/FilledTextFieldTokens.kt`
- `src/commonMain/kotlin/androidx/compose/material3/tokens/OutlinedTextFieldTokens.kt`
- `src/commonMain/kotlin/androidx/compose/material3/tokens/TypeScaleTokens.kt`
- `src/androidDeviceTest/kotlin/androidx/compose/material3/TextFieldTest.kt`
- `src/androidDeviceTest/kotlin/androidx/compose/material3/OutlinedTextFieldTest.kt`

## Filled baseline

The filled field ports these Compose contracts:

- 280dp minimum width and 56dp minimum height;
- filled `SurfaceContainerHighest` container;
- top-only extra-small container corners;
- 1dp unfocused and 2dp focused bottom indicator;
- BodyLarge input/expanded-label typography and BodySmall minimized-label/supporting typography;
- label, placeholder, supporting/error text, leading/trailing icon, prefix, and suffix slots;
- enabled, focused, invalid, disabled, and read-only state styling;
- multiline-by-default behavior with a single-line opt-out;
- Material motion samples for label/indicator transitions.

## Outlined baseline

The outlined field shares the same public slot/form contract and ports the outlined-specific Compose defaults:

- 280dp minimum width and 56dp minimum height;
- transparent container with `CornerExtraSmall` (4dp) corners on all sides;
- 1dp unfocused and 2dp focused outline;
- `Outline` default border, `Primary` focused border, and `Error` invalid border;
- disabled outline uses `OnSurface` at 12% while disabled content uses the normal 38% content opacity;
- 16dp content padding and a 4dp inline cutout inset around the minimized label;
- BodyLarge expanded label/input and BodySmall cutout label/supporting text;
- the same leading/trailing icon, prefix/suffix, error/supporting, multiline and form-state semantics as the filled field.

## Web semantic translations

These are intentional DOM translations rather than literal Compose mechanisms:

- `react-aria-components` `TextField`, `Label`, `Input`/`TextArea`, `Text`, and `FieldError` own form semantics, validation relationships, keyboard behavior, and controlled/uncontrolled state.
- Multiline Compose behavior maps to a native `<textarea>` by default; `isMultiline={false}` maps to a native `<input>`.
- The visible label keeps native `<label>` click-to-focus behavior.
- React Aria may expose both description and error relationships for accessibility, while CSS keeps one visible Material supporting slot: a rendered error replaces supporting text visually.
- Focus, invalid, and disabled visuals resolve from React Aria data attributes in CSS rather than a duplicate React interaction state machine.
- Floating-label emptiness uses native `:placeholder-shown` so controlled and uncontrolled values do not require mirrored component state.
- The outlined border uses a presentation-only native `<fieldset>/<legend>` pair. The legend creates the cutout from the label's intrinsic width without JavaScript measurement or a duplicated label node; a CSS bridge restores the top border while the label is expanded inside the field.

## Regression coverage

Storybook covers both variants across empty, populated, invalid, disabled, icons/affixes, multiline, state matrices, light/dark themes, and dynamic source-color themes. Playwright keeps the existing filled visual goldens and adds outlined DOM/layout assertions for the 56px container, 1/2px border transition, 4px shape, label cutout behavior, label click-to-focus, invalid+focused precedence, multiline semantics, and responsive theme-card width. Unit tests cover immutable token/default mappings, disabled outline opacity, cutout spacing, typography, and motion values.
