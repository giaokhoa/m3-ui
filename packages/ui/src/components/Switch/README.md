# Switch parity notes

The React Switch ports the Material 3 Compose runtime contract while React Aria Components owns native web switch semantics, form behavior and keyboard interaction.

## Pinned AndroidX baseline

- Repository: `https://android.googlesource.com/platform/frameworks/support`
- Revision: `160825094a81825468a95b115bfb1b541e549856`
- Module: `compose/material3/material3`

### Source files

- `src/commonMain/kotlin/androidx/compose/material3/Switch.kt`
- `src/commonMain/kotlin/androidx/compose/material3/tokens/SwitchTokens.kt`
- `src/androidDeviceTest/kotlin/androidx/compose/material3/SwitchTest.kt`
- `src/androidDeviceTest/kotlin/androidx/compose/material3/SwitchScreenshotTest.kt`

## Ported runtime contract

- visual track: 52 × 32px, full shape, 2px outline;
- interactive minimum: 48px, producing a 52 × 48px default web interaction box;
- thumb state layer: 40px;
- unchecked thumb: 16px;
- checked thumb: 24px;
- thumb with content: 24px even when unchecked;
- pressed thumb: 28px;
- thumb content guidance: 16px;
- unchecked offsets: 8px without content, 4px with content;
- checked offset: 24px;
- pressed offsets snap to 2px unchecked and 22px checked;
- checked/unchecked and press-release geometry uses the pinned standard `FastSpatial` motion; entering the pressed target snaps immediately, matching `SnapSpec` in `ThumbNode`;
- logical inline positioning mirrors Compose `placeRelative` in RTL.

`SwitchColors` at the pinned revision resolves track/thumb/border/icon colors only from `enabled × checked`. Generated hover/focus/pressed handle and track colors are not promoted into runtime behavior because `SwitchImpl` does not consume those generated interaction colors.

Disabled colors follow `SwitchDefaults.colors`: token colors with opacity are composited over the active `surface` role rather than mixed with transparency. This is especially important for the disabled track, border and thumb on non-Surface page backgrounds.

## Ripple and focus

The thumb owns the normal unbounded Material indication with a fixed 20px radius / 40px state-layer diameter. Hover/focus state ordering follows the latest still-active interaction, as in the shared Material ripple behavior.

When `ThemeProvider rippleFocus="inset-ring"` is enabled, Compose disables focus indication on the thumb and adds a focus-only indication around the full 52 × 32px track. The web implementation follows the same split using the shared Ripple primitive. Hover and press indication remain on the thumb.

## Web translations and remaining gaps

- React Aria `Switch` provides role=`switch`, keyboard interaction, controlled/uncontrolled state, form naming and native hidden-input behavior.
- Visible `children` are a web convenience label; Compose `Switch` itself does not render adjacent text. The 8px control-to-label gap is therefore an intentional **library-owned web token** (`component.switch.labelGap`), not an AndroidX parity mapping.
- `thumbContent` is rendered inside the visual control and inherits the Material icon color. The visual control is aria-hidden because the native switch is the semantic source of truth.
- RAC `isReadOnly` is the closest web state to Compose `onCheckedChange = null`, but it is intentionally not a literal port. Compose removes its toggleable modifier and minimum-interactive enforcement when the callback is null; the web component retains native switch semantics and the normal 52 × 48px interaction layout.
- `LocalMinimumInteractiveComponentSize` has no public ThemeProvider equivalent yet.
- Compose itself still has a TODO for swipeable Switch behavior, so no drag gesture is added on the web.
- Standard Compose springs are sampled into CSS `linear()` curves; custom runtime MotionScheme instances are not dynamically translated.

## Verification

Unit coverage locks geometry, theme-role mappings, surface compositing, the library-owned web label gap, and FastSpatial timing. Storybook/Chromium coverage verifies native switch toggling, thumb geometry/offsets, press snap/release motion, disabled composites, RTL positioning, thumb content sizing, ambient state-layer behavior and opacity-vs-inset focus placement. The corresponding AndroidX screenshot matrix covers checked/unchecked, RTL, pressed, disabled, hover, opacity focus, inset focus, transition frames and checked/unchecked thumb icons.
