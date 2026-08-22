# Ripple parity notes

The shared Ripple primitive translates Material 3 Compose indication behavior into DOM/CSS while React Aria Components remain the source of interaction semantics.

## Pinned AndroidX baseline

- Repository: `https://android.googlesource.com/platform/frameworks/support`
- Revision: `160825094a81825468a95b115bfb1b541e549856`

### Source files

- `compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/Ripple.kt`
- `compose/material3/material3-ripple/src/commonMain/kotlin/androidx/compose/material3/ripple/Ripple.kt`
- `compose/material3/material3-ripple/src/commonMain/kotlin/androidx/compose/material3/ripple/RippleNodeConfiguration.kt`
- `compose/material3/material3-ripple/src/commonMain/kotlin/androidx/compose/material3/ripple/Border.kt`
- `compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/StateTokens.kt`
- `compose/material3/material3/src/androidDeviceTest/kotlin/androidx/compose/material3/RadioButtonTest.kt`
- `compose/material3/material3/src/androidDeviceTest/kotlin/androidx/compose/material3/CheckboxTest.kt`

## Ported runtime contract

The default remains the opacity-based Material focus indication. `ThemeProvider rippleFocus="inset-ring"` is the web theme-level equivalent of Compose's `RippleDefaults.InsetFocusRingThemeConfiguration` supplied through `LocalRippleThemeConfiguration`.

The inset focus ring uses the pinned AndroidX defaults:

- outer stroke inset: 0px;
- outer stroke width: 2px;
- inner stroke inset: 1px;
- inner stroke width: 3px;
- outer stroke color: `Secondary`;
- inner stroke color: `OnSecondary`;
- focusing motion: standard `FastSpatial` spring sampled to about 137ms for CSS;
- unfocusing motion: standard `FastEffects` spring sampled to about 108ms for CSS.

The focus ring is sized from the indication modifier's coordinator bounds, not from the minimum touch-target layout and not from the state-layer radius. Compose modifier order makes these distinct for compact selection controls:

- Button: the Surface indication follows the visual container bounds; the baseline button is 40px high;
- Checkbox corrected M3 path: 48px minimum interactive layout, 40px state layer, 18px indication bounds;
- RadioButton: 48px minimum interactive layout, 40px state layer, 24px indication bounds (`2px + 20px + 2px`).

The web Ripple host still spans each component's interaction slot for wave/state-layer behavior, so Checkbox and RadioButton pass a token-derived `focusRingInset` to center the smaller Compose indication bounds inside that host.

Focus-ring shapes are resolved at component callsites, matching Compose ownership:

- Button: current container radius through `--_button-container-radius`;
- Checkbox: `RoundedCornerShape(25)` on the 18px indication bounds resolves to a 4.5px corner radius;
- RadioButton: `CircleShape` on the 24px indication bounds resolves to a 12px corner radius.

AndroidX `BorderLogic` creates the shape outline from the original indication size and then shrinks its corner radius by the animated border inset. The web implementation therefore carries the original radius as a CSS length and animates each pseudo-border radius to `radius - inset`; it intentionally does not re-evaluate a percentage radius against the smaller inset pseudo-element box. For example, Checkbox's inner focus outline ends at 3.5px, not 25% of a 16px box (4px).

The focus ring is painted above component content, matching the lower-level Compose ordering of `drawContent()`, ripple waves, and then state/focus indication. Inset focus remains active independently of the latest hover state-layer interaction, because Compose tracks focus-ring interpolation separately from opacity state-layer ordering.

## Web translations and remaining gaps

- `ThemeProvider.rippleFocus` is the global web analogue of `LocalRippleThemeConfiguration`; the default is `opacity` so existing applications do not change behavior.
- When a host does not set `--ripple-color`, the primitive uses inherited `currentColor`, matching Compose `Color.Unspecified` resolving through the current content color. It intentionally does not hardcode a theme role such as `onSurface`.
- React Aria `isFocusVisible` is used rather than raw DOM focus so keyboard-visible focus semantics remain platform appropriate.
- The shared primitive supports component shapes representable by CSS border radius. It does not yet expose arbitrary Compose `Shape` geometry.
- Compose `LocalRippleConfiguration` supports subtree overrides for color, alpha, focus colors and disabling ripple entirely. The web primitive currently relies on component CSS variables/style overrides and does not expose a matching public provider.
- Drag indication is not wired because the current Button, Checkbox and RadioButton RAC integrations do not expose Material drag interactions.
- Standard Compose springs are sampled into CSS `linear()` curves; custom runtime MotionScheme instances are not dynamically translated.
- In forced-colors mode, component-specific system-color focus affordances remain authoritative and the custom inset ring is hidden.

## Verification

Unit tests lock Material state-layer and inset-ring constants. Storybook exposes opacity, inset-ring and side-by-side focus previews. Chromium tests verify default opacity behavior, stroke widths/insets/colors, overlay ordering, Button 40px visual indication bounds, Checkbox 48/40/18 target/state/ring geometry with 4.5px → 3.5px inset radius, RadioButton 48/40/24 geometry with 12px → 11px inset radius, and the independent focus-ring + hover-state-layer case.
