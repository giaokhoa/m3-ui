# ScrollField parity notes

- AndroidX source of truth: `compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/ScrollField.kt` at `ff9a7111302243197384c499d5e3461c1804cd6e`.
- AndroidX behavior retained: centered three-row wheel, ArrowUp/ArrowDown one-step selection, nearest-item settle, click-to-select, wrap-around intent, disabled state, and discrete current-value accessibility.
- Web adaptation: the public API uses controlled/uncontrolled React indices and either `items` or `itemCount + renderItem`; it does not expose `PagerState`, coroutine APIs, `Dp`, or Compose interaction sources.
- The web implementation virtualizes a five-slot window around the current value rather than duplicating a 100,000-page pager, keeping DOM size constant.
- `role="spinbutton"` exposes the current unique index/value text while the visible wheel rows are hidden from the accessibility tree so animation does not generate frame-by-frame announcements.
- Canonical tokens remain owned by `packages/tokens/tokens/**/*.json`; this component consumes existing semantic CSS variables and does not add screenshot-only token overrides.
- Material Web audit pin: `cac97678831d48d4eb4a606ca50f92673a1dc20c`; Material Web has select/menu primitives but no equivalent infinite wheel picker, so no Material Web component implementation is copied.
