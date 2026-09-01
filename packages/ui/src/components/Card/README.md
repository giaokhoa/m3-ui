# Card parity notes

The React Card family preserves the Material 3 Compose Card semantic defaults while translating immutable paint/geometry through canonical DTCG and generated CSS, and keeping genuinely live interaction behavior in narrow runtime TypeScript.

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

## Static/runtime split

Immutable Card shape, minimum interactive size, variant colors, disabled composites and outlined border defaults live in canonical Card DTCG and are serialized by the generated `@m3-ui/tokens/card.css` adapter. `card.css` owns structural rendering and state selectors.

Runtime TypeScript is limited to the native clickable-Card behavior needed by the roleless rich-content host, current hover/focus/press booleans at that native host boundary, ripple wave lifecycle, and real per-instance overrides such as the `shape` prop or caller `style`. Common interaction precedence, semantic elevation selection, and elevation transition history belong to shared `Elevation`, not a Card-local interaction-ordering layer.

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
- base / pressed / focused / disabled elevation: level 0;
- hovered elevation follows the current canonical Card elevation token;
- dragged elevation token: level 3;
- disabled outline: `Outline @ 12%` composited over `ElevatedCardTokens.ContainerColor` (`SurfaceContainerLow`) exactly as `CardDefaults.outlinedCardBorder()` does at the pinned revision.

The generated `HoverOutlineColor`, `FocusOutlineColor`, and `PressedOutlineColor` tokens are not promoted into runtime behavior. The pinned `CardDefaults.outlinedCardBorder()` resolves the border only from enabled vs disabled.

## Elevation motion

Clickable Card is a native/non-RAC host because its roleless rich-content semantics and nested interactive descendants do not map safely to a native button wrapper. The host tracks only current hover/focus/press booleans needed for its own pointer/keyboard behavior. Shared `Elevation` receives those current booleans plus the Card semantic level set, applies the repository precedence `disabled > pressed > hovered > focused > default`, and owns any previous-state bookkeeping needed for incoming/outgoing motion.

The shared elevation primitive uses the pinned Material 3 internal tween selection:

- incoming interaction: 120ms, FastOutSlowIn;
- outgoing press/focus: 150ms, cubic-bezier(0.4, 0, 0.6, 1);
- outgoing hover: 120ms, cubic-bezier(0.4, 0, 0.6, 1);
- disabled/unknown baseline transitions snap.

Drag elevation remains represented in canonical Card tokens, but there is no invented public drag interaction state. Compose exposes drag elevation through `InteractionSource`; the web library does not yet expose an equivalent interaction-source API.

## Clickable surface translation

Compose's clickable `Surface` provides click semantics but intentionally sets no semantic role by default. The web Card therefore:

- is a plain non-focusable container when `onPress` is absent;
- becomes focusable and keyboard/pointer pressable when `onPress` is supplied;
- does not force a `button` role; consumers may opt into an explicit `role` when that matches their content model;
- uses `aria-disabled` and removes disabled cards from sequential keyboard focus;
- ignores presses originating from nested interactive descendants so a child Button/Link does not also activate the card parent.

A native `<button>` wrapper is deliberately not used because rich cards commonly contain nested actions, which would create invalid HTML and flattened accessibility semantics. For the same reason Card keeps a narrow native press adapter instead of inventing a RAC semantic host that changes the content model. That adapter owns Card activation/nested-target filtering and normalizes pointer/keyboard/virtual coordinates into shared Ripple wave lifecycle; Ripple receives current hover/focus-visible indication directly and does not own a second interaction state machine.

The clickable surface uses the shared bounded Ripple. Opacity focus is rendered as the normal state layer; `ThemeProvider rippleFocus="inset-ring"` moves keyboard focus to the shared inset focus ring using the card shape.

## Remaining differences

- Compose `LocalMinimumInteractiveComponentSize` is not configurable from ThemeProvider yet. Clickable web cards enforce the default 48px minimum on the visual surface rather than maintaining a separately laid-out outer hit target for pathological cards smaller than 48px.
- Compose `CardColors`, arbitrary `Shape`, custom `CardElevation`, and hoisted `MutableInteractionSource` have no one-to-one public objects yet. Generated role-backed CSS, the `shape` radius prop, caller `style`, and shared Elevation semantic level-set integration cover the current web surface without duplicating Compose runtime objects.
- Arbitrary non-rounded Compose shapes cannot be represented by CSS `border-radius` alone.
- AndroidX has binary screenshot goldens for Card states. Storybook and Chromium behavior/computed-style regression coverage provide the web visual gate but do not claim AndroidX PNG identity.
