# TextField parity notes

`TextField` is a web port of the Material 3 filled text field. The target is behavioral and visual parity with Jetpack Compose where the behavior has a meaningful DOM equivalent, while native HTML and React Aria Components own web semantics.

## Pinned AndroidX baseline

- Repository: `https://android.googlesource.com/platform/frameworks/support`
- Revision: `160825094a81825468a95b115bfb1b541e549856`
- Material3 module root: `compose/material3/material3`

The revision is intentionally pinned rather than following `androidx-main`. Upstream changes must be adopted explicitly and reviewed as parity drift.

### Source files

- `src/commonMain/kotlin/androidx/compose/material3/TextField.kt`
- `src/commonMain/kotlin/androidx/compose/material3/TextFieldDefaults.kt`
- `src/commonMain/kotlin/androidx/compose/material3/internal/TextFieldImpl.kt`
- `src/commonMain/kotlin/androidx/compose/material3/tokens/FilledTextFieldTokens.kt`
- `src/commonMain/kotlin/androidx/compose/material3/tokens/TypeScaleTokens.kt`
- `src/androidDeviceTest/kotlin/androidx/compose/material3/TextFieldTest.kt`

## Ported baseline

The filled field currently ports these Compose contracts:

- 280dp minimum width and 56dp minimum height;
- filled `SurfaceContainerHighest` container;
- top-only extra-small container corners;
- 1dp unfocused and 2dp focused bottom indicator;
- BodyLarge input/expanded-label typography and BodySmall minimized-label/supporting typography;
- label, placeholder, supporting/error text, leading/trailing icon, prefix, and suffix slots;
- enabled, focused, invalid, disabled, and read-only state styling;
- multiline-by-default behavior with a single-line opt-out;
- Material motion samples for label/indicator transitions.

## Web semantic translations

These are intentional DOM translations rather than literal Compose mechanisms:

- `react-aria-components` `TextField`, `Label`, `Input`/`TextArea`, `Text`, and `FieldError` own form semantics, validation relationships, keyboard behavior, and controlled/uncontrolled state.
- Multiline Compose behavior maps to a native `<textarea>` by default; `isMultiline={false}` maps to a native `<input>`.
- The visible label keeps native `<label>` click-to-focus behavior.
- React Aria may expose both description and error relationships for accessibility, while CSS keeps one visible Material supporting slot: a rendered error replaces supporting text visually.
- Focus, invalid, and disabled visuals resolve from React Aria data attributes in CSS rather than a duplicate React interaction state machine.
- Floating-label emptiness uses native `:placeholder-shown` so controlled and uncontrolled values do not require mirrored component state.

## Regression coverage

Storybook + Playwright cover empty, populated, focused, invalid, invalid+focused priority, disabled, icons/affixes, multiline, theme matrices, responsive width constraints, label click-to-focus, and the single visible supporting/error slot. Unit tests cover immutable token/default mappings and motion values.
