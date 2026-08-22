# Ripple parity notes

The shared Ripple primitive translates Material 3 Compose indication behavior into DOM/CSS while React Aria Components remain the source of interaction semantics.

## Pinned AndroidX baseline

- Repository: `https://android.googlesource.com/platform/frameworks/support`
- Revision: `160825094a81825468a95b115bfb1b541e549856`

### Source files

- `compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/Ripple.kt`
- `compose/material3/material3-ripple/src/commonMain/kotlin/androidx/compose/material3/ripple/Ripple.kt`
- `compose/material3/material3-ripple/src/commonMain/kotlin/androidx/compose/material3/ripple/RippleNodeConfiguration.kt`
- `compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/StateTokens.kt`

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

The ring is sized from the entire interaction node, independently of the ripple state-layer radius. This matters for RadioButton and Checkbox, where the interaction target is 48px while the state layer is 40px.

Focus-ring shapes are resolved at component callsites, matching Compose ownership:

- Button: current container shape via inherited border radius;
- Checkbox: `RoundedCornerShape(25)` mapped to 25%;
- RadioButton: `CircleShape` mapped to 50%.

Inset focus remains active independently of the latest hover state-layer interaction, matching the lower-level Compose ripple node, where focus-ring interpolation tracks focus separately from opacity state-layer ordering.

## Web translations and remaining gaps

- `ThemeProvider.rippleFocus` is the global web analogue of `LocalRippleThemeConfiguration`; the default is `opacity` so existing applications do not change behavior.
- React Aria `isFocusVisible` is used rather than raw DOM focus so keyboard-visible focus semantics remain platform appropriate.
- The shared primitive supports component shapes representable by CSS border radius. It does not yet expose arbitrary Compose `Shape` geometry.
- Compose `LocalRippleConfiguration` supports subtree overrides for color, alpha, focus colors and disabling ripple entirely. The web primitive currently relies on component CSS variables/style overrides and does not expose a matching public provider.
- Drag indication is not wired because the current Button, Checkbox and RadioButton RAC integrations do not expose Material drag interactions.
- Standard Compose springs are sampled into CSS `linear()` curves; custom runtime MotionScheme instances are not dynamically translated.
- In forced-colors mode, component-specific system-color focus affordances remain authoritative and the custom inset ring is hidden.

## Verification

Unit tests lock Material state-layer and inset-ring constants. Storybook exposes opacity, inset-ring and side-by-side focus previews. Chromium tests verify default opacity behavior, full-target ring bounds, stroke widths/insets/colors, Button/Checkbox/RadioButton shapes, and the independent focus-ring + hover-state-layer case.
