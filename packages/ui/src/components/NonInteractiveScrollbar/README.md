# NonInteractiveScrollbar parity notes

## Sources

- AndroidX source of truth: `compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/Scrollbar.kt`
- AndroidX revision: `ff9a7111302243197384c499d5e3461c1804cd6e`
- Relevant AndroidX tests: `compose/material3/material3/src/androidDeviceTest/kotlin/androidx/compose/material3/ScrollbarTest.kt`
- Material Web audit revision: `cac97678831d48d4eb4a606ca50f92673a1dc20c`

Material Web does not expose an equivalent non-interactive scrollbar component at the pinned audit revision. The web implementation therefore adapts the AndroidX behavior onto native DOM scroll metrics and events.

## Defaults

The public defaults mirror AndroidX `NonInteractiveScrollbarDefaults`: 4px thickness, 24px minimum thumb length, 0.9 maximum thumb fraction, 2px main-axis inset, 0px cross-axis inset, 250ms fade duration, 400ms fade delay, and outline at 70% opacity for the thumb. No canonical token files are changed for this component because those values are upstream component defaults rather than generated token inputs in this repository.

## Web adaptations

- `scrollRef` reads native `scrollTop`/`scrollLeft`, viewport and content dimensions. `metricsAdapter` supports virtual/non-native scrollers without exposing Compose concepts.
- Horizontal RTL offsets are normalized to logical inline-start distance and the thumb is positioned with logical CSS inset properties.
- Native `scroll` events drive active/fade state. `ResizeObserver` and `MutationObserver` recompute geometry without polling while idle.
- The scrollbar is decorative: `aria-hidden="true"` and `pointer-events:none`. It has no drag, keyboard, focus, or custom scroll-physics behavior.
- `prefers-reduced-motion: reduce` removes the opacity transition duration but preserves the fade delay and visibility state machine, matching the AndroidX reduced-animation contract.
- Track/thumb style overrides are plain React `CSSProperties` objects.

## Geometry

The thumb length is `trackLength * viewportSize / contentSize`, clamped between the configured minimum and maximum fraction. The thumb offset is proportional to `scrollOffset / (contentSize - viewportSize)`. The component hides when there is no overflow, dimensions are invalid, or the available track cannot accommodate the minimum thumb.
