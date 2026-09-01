# Slider

Material 3 single-value and range sliders backed by React Aria Components.

## Public API

- `Slider` — one thumb.
- `RangeSlider` — two thumbs with constrained start/end semantics.
- `size="xSmall | small | medium | large | xLarge"` — current Material size family; `xSmall` is the pinned Compose baseline geometry.
- `orientation="horizontal | vertical"` — RAC owns pointer, keyboard, RTL and vertical interaction behavior.
- `showTicks` — explicit Material Web discrete-tick adaptation.
- `showValueIndicator` — explicit Material Web value-indicator adaptation.

## Ownership

React Aria `Slider`, `SliderTrack` and `SliderThumb` own slider semantics, hidden native range inputs, focus, keyboard increments, dragging, controlled/uncontrolled values, min/max/step and multi-thumb constraints. The Material wrapper does not install a competing gesture engine.

Canonical DTCG owns the current five size families, semantic handle/track/stop/value-indicator colors, enabled/disabled opacity, handle widths, stop indicators and value-indicator typography. The convention-discovered Style Dictionary Slider adapter compiles those immutable facts into `@m3-ui/tokens/slider.css`, while handwritten `slider.css` owns structural layout/state selectors and non-token renderer mechanics. React keeps only live value/range/tick/orientation arithmetic and real user overrides; it does not project a static token bag into inline CSS variables.

Semantic colors alias `color.role.*`, so `ThemeProvider sourceColor` updates Slider paint through inherited system-role variables and the CSS cascade rather than a component-specific resolver.

Pinned references:

- AndroidX Compose Material3 `Slider.kt`: `ff9a7111302243197384c499d5e3461c1804cd6e`.
- Material Web public slider adapter: `cac97678831d48d4eb4a606ca50f92673a1dc20c`.
- Material Web generated tokens: 34.0.21.

## Runtime reconciliation

Current Compose halves the thumb's cross-axis dimension whenever focus, press or drag interaction is active. For the baseline this is 4px -> 2px. RAC exposes focus/drag state directly, so the web wrapper maps those states without an interaction-source clone; hover remains 4px.

Current Compose uses the Material ripple primitive in Slider only for the optional inset focus-ring configuration, with press, drag and hover ripple indication disabled. The web Slider therefore reuses the shared `Ripple` only for the same inset-focus responsibility and does not add a synthetic press wave.

The track keeps the canonical 6px thumb gap and the structural 2px inside corner. `48px` minimum thumb target and Material Web's `200px` minimum inline track are handwritten renderer mechanics rather than fabricated DTCG tokens or TypeScript defaults.

Material Web 34.0.21 differs from Compose generated tokens for stop indicators. The generated adapter deliberately consumes the canonical `webCurrent` projection: unselected `onSecondaryContainer`, selected `onPrimary`, active-disabled `inverseOnSurface`, inactive-disabled `onSurface`, and 4px trailing spacing. The drift remains documented in `audit/material-web-slider-drift.json` rather than being collapsed into one source.

The value indicator is a Web public adaptation. Its current generated typography intentionally combines LabelLarge font/size/line-height with BodyLarge weight/tracking; the generated adapter preserves that canonical split and resolves the LabelLarge typeface role through the shared typography CSS variables.

## Range and value scale

The web API keeps RAC/Material Web numeric defaults (`0..100`, `step=1`) because React Aria's accessible range-input model requires a concrete step. Compose's normalized `0..1` continuous state remains available by passing `minValue={0}`, `maxValue={1}` and the desired web step explicitly. `RangeSlider` defaults to the full configured range when no value is supplied, matching Compose's `rememberRangeSliderState(startValue=0, endValue=1)` structurally without inventing intermediate default values.

## Intentional boundaries

- Track icons from the newer medium/large/xLarge token modules are retained in canonical tokens but are not exposed until the corresponding current public layout contract is implemented and browser-tested.
- Arbitrary Compose custom thumb/track composables remain normal web composition concerns rather than Kotlin-shaped props.
- Deprecated Material Web state-layer and overlap-outline token families are not promoted back into the current public contract.
- `showTicks` is opt-in, matching the Material Web public adapter. RAC `step` remains the web stepping primitive rather than introducing Compose's separate `steps` count API.
