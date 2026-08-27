# SecureTextField parity notes

`SecureTextField` and `OutlinedSecureTextField` reuse the existing TextField renderer and token projection. They intentionally add only secure-entry semantics and reveal state on top of the filled/outlined family.

## Pinned sources

AndroidX Compose Material3 revision: `ff9a7111302243197384c499d5e3461c1804cd6e`.

Reviewed source files:

- `compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/SecureTextField.kt`
- `compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/TextField.kt`
- `compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/OutlinedTextField.kt`
- `compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/TextFieldDefaults.kt`

Material Web audit/reference pin: `cac97678831d48d4eb4a606ca50f92673a1dc20c`.

Canonical repo token input remains `packages/tokens/tokens/**/*.json` through Style Dictionary. This task does not change canonical tokens; secure fields inherit TextField token projection and geometry.

## Web adaptation

- Secure fields are always native single-line `<input>` controls.
- Obfuscated mode uses native `type="password"`; revealed mode changes the same input to `type="text"`.
- The plaintext value is never mirrored into component state for rendering, DOM text, or `data-*` attributes.
- Controlled and uncontrolled value semantics remain owned by React Aria TextField.
- `autoComplete`, `name`, form submission, password-manager behavior, validation, label, placeholder, supporting/error text, prefix/suffix and leading/trailing slots pass through the existing TextField contract.
- The optional reveal button is `type="button"`, keyboard accessible, has pressed/label semantics, and restores input focus/selection where browser selection APIs allow it.
- Unlike Compose `BasicSecureTextField`, the web implementation does not claim to block copy/cut, browser developer tools, extensions, accessibility tooling, or other browser/platform access to a value. No clipboard blocker is implemented.

## Browser contracts

Storybook and Playwright cover password DOM semantics, filled/outlined geometry, controlled/uncontrolled value handling, label/placeholder/supporting/error states, disabled state, reveal/hide focus and caret preservation, actual form submission value, autocomplete passthrough, no plaintext duplication into DOM text/data attributes, and RTL.
