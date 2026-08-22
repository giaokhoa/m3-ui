# Card parity notes

The React Card family ports the Material 3 Compose Card runtime defaults while preserving web-safe DOM structure for rich card content.

## Pinned AndroidX baseline

- Repository: `androidx/androidx`
- Revision: `160825094a81825468a95b115bfb1b541e549856`
- Module: `compose/material3/material3`

### Source files

- `src/commonMain/kotlin/androidx/compose/material3/Card.kt`
- `src/commonMain/kotlin/androidx/compose/material3/Surface.kt`
- `src/commonMain/kotlin/androidx/compose/material3/internal/Elevation.kt`
- `src/commonMain/kotlin/androidx/compose/material3/tokens/FilledCardTokens.kt`
- `src/commonMain/kotlin/androidx/compose/material3/tokens/ElevatedCardTokens.kt`
- `src/commonMain/kotlin/androidx/compose/material3/tokens/OutlinedCardTokens.kt`
- `src/androidDeviceTest/kotlin/androidx/compose/material3/CardTest.kt`
- `src/androidDeviceTest/kotlin/androidx/compose/material3/CardScreenshotTest.kt`

## Default variants

All three variants use the pinned `CornerMedium` shape, mapped to a 12px CSS radius.

### Filled Card

- container: `SurfaceContainerHighest`;
- base / pressed / focused / disabled elevation: level 0;
- hovered elevation: level 1;
- dragged elevation token: level 3;
- disabled container: `SurfaceVariant @ 38%` composited over `SurfaceContainerHighest`.

### Elevated Card

- container: `SurfaceContainerLow`;
- base / pressed / focused / disabled elevation: level 1;
- hovered elevation: level 2;
- dragged elevation token: level 4;
- disabled container: `Surface @ 38%` composited over `Surface`, which resolves to Surface.

### Outlined Card

- container: `Surface`;
- outline: `OutlineVariant`, 1px;
- base / pressed / focused / hovered / disabled elevation: level 0;
- dragged elevation token: level 3;
- disabled outline: `Outline @ 12%` composited over `ElevatedCardTokens.ContainerColor` (`SurfaceContainerLow`) exactly as `CardDefaults.outlinedCardBorder()` does at the pinned revision.

The generated `HoverOutlineColor`, `FocusOutlineColor`, and `PressedOutlineColor` tokens are not promoted into runtime behavior. The pinned `CardDefaults.outlinedCardBorder()` resolves the border only from enabled vs disabled.

## Elevation motion

`CardElevation` keeps the active Compose interactions in chronological order and resolves the latest still-active interaction. The web implementation mirrors this for press, hover, and focus.

The shared elevation primitive uses the pinned Material 3 internal tween selection:

- incoming interaction: 120ms, FastOutSlowIn;
- outgoing press/focus: 150ms, cubic-bezier(0.4, 0, 0.6, 1);
- outgoing hover: 120ms, cubic-bezier(0.4, 0, 0.6, 1);
- disabled/unknown baseline transitions snap.

Drag elevation remains represented in `@m3/tokens/card`, but there is no invented public drag interaction state. Compose exposes drag elevation through `InteractionSource`; the web library does not yet expose an equivalent interaction-source API.

## Clickable surface translation

Compose's clickable `Surface` provides click semantics but intentionally sets no semantic role by default. The web Card therefore:

- is a plain non-focusable container when `onPress` is absent;
- becomes focusable and keyboard/pointer pressable when `onPress` is supplied;
- does not force a `button` role; consumers may opt into an explicit `role` when that matches their content model;
- uses `aria-disabled` and removes disabled cards from sequential keyboard focus;
- ignores presses originating from nested interactive descendants so a child Button/Link does not also activate the card parent.

A native `<button>` wrapper is deliberately not used because rich cards commonly contain nested actions, which would create invalid HTML and flattened accessibility semantics.

The clickable surface uses the shared bounded Ripple. Opacity focus is rendered as the normal state layer; `ThemeProvider rippleFocus="inset-ring"` moves keyboard focus to the shared inset focus ring using the card shape.

## Remaining differences

- Compose `LocalMinimumInteractiveComponentSize` is not configurable from ThemeProvider yet. Clickable web cards enforce the default 48px minimum on the visual surface rather than maintaining a separately laid-out outer hit target for pathological cards smaller than 48px.
- Compose `CardColors`, arbitrary `Shape`, custom `CardElevation`, and hoisted `MutableInteractionSource` have no one-to-one public objects yet. CSS variables / `style`, the `shape` radius prop, and ThemeProvider cover the current web customization surface.
- Arbitrary non-rounded Compose shapes cannot be represented by CSS `border-radius` alone.
- AndroidX has binary screenshot goldens for Card states. This branch adds Storybook and Chromium behavior/computed-style regression coverage but does not claim new Card PNG goldens.
