# Loading Indicator

Material 3 expressive loading indicators backed by the canonical Style Dictionary token graph and React Aria Components progress semantics.

## Public API

- `LoadingIndicator`
- `ContainedLoadingIndicator`

Both components are indeterminate when `value` is omitted. Passing `value` selects determinate mode; values are coerced to `0..1`, matching the Material 3 Compose API.

The visual has no visible label. Consumers should provide an accessible name with `aria-label` or `aria-labelledby`.

## Sources

Pinned AndroidX Compose source: `androidx/androidx@ff9a7111302243197384c499d5e3461c1804cd6e`:

- `compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/LoadingIndicator.kt`
- `compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/MaterialShapes.kt`

Canonical component tokens come only from `packages/tokens/tokens/component/loading-indicator.json`:

- 48px container width/height
- 38px active indicator size
- full container shape
- primary active color
- primary-container / on-primary-container contained colors

Renderer mechanics remain beside the component instead of becoming fabricated tokens:

- 650ms morph cadence
- 4666ms global rotation
- spring damping ratio 0.6, stiffness 200, visibility threshold 0.1
- determinate counter-clockwise 180° rotation
- indeterminate quarter-turn morph rotation

## Shape geometry

`packages/ui/src/internal/material-shapes` is a focused TypeScript port of the Apache-2.0 AndroidX Graphics Shapes algorithms used by Material 3. The morph engine follows the `material-shapes-ts` port at commit `9ed10551be53e737110b9b6a10f6231345e7a9c4`; the actual loading shape definitions are projected from the pinned AndroidX Material 3 Kotlin source.

Determinate mode morphs a 10-vertex Material circle rotated by 18° into `SoftBurst`.

Indeterminate mode cycles:

`SoftBurst → Cookie9Sided → Pentagon → Pill → Sunny → Cookie4Sided → Oval → SoftBurst`.

`prefers-reduced-motion: reduce` freezes the indeterminate renderer at its initial frame while preserving progress semantics.
