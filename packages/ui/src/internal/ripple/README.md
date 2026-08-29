# Ripple parity and architecture contract

Read this file before changing `packages/ui/src/internal/ripple`, ripple/state-layer token serialization, focus indication, or component ripple injection.

The shared Ripple primitive translates Material 3 Compose indication behavior into DOM/CSS while React Aria Components remain the source of interaction semantics.

## Ownership boundary

```text
React Aria / host component
        |
        | press / hover / focus-visible
        v
material interaction state
        |
        +--------------------+
        |                    |
        v                    v
   useRipple()            <Ripple />
 runtime geometry         paint DOM
 + wave lifecycle             |
                              v
                    generated ripple.css
                    static Material tokens
                              |
                              v
                     handwritten ripple.css
```

The boundary is intentionally asymmetric:

- React Aria/native host semantics own normalized interaction events;
- `useRipple()` owns only behavior that requires runtime information: wave geometry, bounds, active-wave identity, minimum press lifetime, release scheduling;
- `<Ripple>` owns the DOM layers and runtime geometry variables for current waves/focus bounds;
- Style Dictionary generated `ripple.css` owns immutable state-layer opacity, motion, easing, focus-ring stroke/inset/color/motion bindings;
- handwritten `internal/ripple/ripple.css` owns structural painting rules and animations;
- `ThemeProvider` owns global indication policy (`rippleFocus`) and concrete runtime Material colors.

Static Material token values must not be copied from `@m3-ui/tokens` into a React `style` object on every render merely to transport them into CSS custom properties.

## Runtime values that belong in React

Examples that legitimately remain runtime:

- wave `x` / `y` start position;
- wave target center;
- wave diameter/start scale derived from measured bounds;
- active/releasing wave lifecycle;
- focus-ring radius/inset when a component's indication geometry differs from the ripple host bounds;
- current hover/focus state attributes;
- the theme-level choice between opacity focus and inset focus ring.

The token values controlling how those states look belong in generated CSS.

## Interaction semantics

Do not create a second independent pointer/keyboard state machine inside Ripple when the host component already receives React Aria press/hover/focus events. The host feeds the shared primitive. This differs from Material Web's standalone custom-element ripple, which must attach its own DOM listeners because it cannot assume a React Aria host.

Interaction ordering/history may be coordinated by a small Material interaction helper when multiple effects need the same ordering, analogous in responsibility to Compose `InteractionSource`, but React Aria/native semantics remain the web event source of truth.

## Runtime color model

When a host does not set `--ripple-color`, the primitive uses inherited `currentColor`, matching Compose `Color.Unspecified` resolving through current content color.

Focus-ring token colors semantically reference Material color roles (`Secondary` and `OnSecondary`) in canonical DTCG. The component/ripple token must alias those canonical roles; only the core role endpoint contains `var(--secondary)` / `var(--on-secondary)`. `ThemeProvider` supplies the concrete runtime values.

## Generated CSS location

Generated platform CSS stays centralized with other Style Dictionary artifacts:

```text
packages/tokens/dist/generated/ripple.css
```

The Ripple primitive imports it through the reviewed token-package CSS subpath. Modular `@m3-ui/ui/styles/*.css` entries containing handwritten `internal/ripple/ripple.css` must inline the generated adapter before the handwritten CSS so public style exports remain self-contained.

## Browser value semantics

Generated-artifact tests may lock the canonical textual serialization emitted by Style Dictionary, for example `--_ripple-hover-opacity: 0.08;` in `dist/generated/ripple.css`.

Browser/visual tests must instead validate the **computed semantic value**. A bundler/minifier is allowed to serialize equivalent CSS numbers differently, such as `0.08` becoming `.08`. Browser tests must parse numeric custom-property values before comparing them and must not force runtime inline-style projection or formatter workarounds merely to preserve pre-minification spelling.

This distinction is part of the runtime boundary: generated-source tests own source serialization; browser tests own rendered semantics.

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

## Forbidden regressions

Do not:

- project immutable ripple/state/focus-ring tokens into `<Ripple style={...}>` from React;
- duplicate focus-ring `var(--role)` strings instead of aliasing canonical color roles;
- move concrete Material color ownership out of `ThemeProvider`;
- move wave geometry/measurement into Style Dictionary or static CSS;
- add native pointer/keyboard listeners to Ripple when the host React Aria interaction contract already supplies the event;
- force CSS lexical spellings through runtime inline styles or formatter hacks when bundled browser output is semantically equivalent;
- merge ripple, elevation, focus ring, and content into a monolithic effect primitive with one paint bound;
- hand-edit `packages/tokens/dist/**`.

## Verification

Required coverage includes:

1. canonical AndroidX/state-layer/focus-ring token tests;
2. generated `ripple.css` tests proving static token bindings are emitted and theme roles are not defined;
3. architecture guards proving `<Ripple>` does not project static token constants through React style;
4. modular style tests proving generated ripple CSS precedes handwritten ripple CSS;
5. UI unit/type/build tests;
6. Storybook/Chromium visual regression for default opacity, inset ring, wave geometry, overlay ordering, and forced-colors behavior. Browser numeric custom-property assertions must compare parsed semantic values rather than minifier-dependent lexical spellings.

Existing Chromium coverage verifies default opacity behavior, stroke widths/insets/colors, overlay ordering, Button 40px visual indication bounds, Checkbox 48/40/18 target/state/ring geometry with 4.5px → 3.5px inset radius, RadioButton 48/40/24 geometry with 12px → 11px inset radius, and the independent focus-ring + hover-state-layer case.
