# Progress Indicator

Material 3 progress indicators mapped to the canonical `@m3/tokens` Style Dictionary graph, React Aria `ProgressBar` semantics, pinned AndroidX Compose runtime behavior, and current Material Web web adaptations.

## Public family

- `LinearProgressIndicator`
- `CircularProgressIndicator`
- `LinearWavyProgressIndicator`
- `CircularWavyProgressIndicator`

All four use React Aria Components `ProgressBar` as the semantic owner. The Material wrapper defaults to the Material/Compose/Web 0..1 value range (`minValue=0`, `maxValue=1`) while still accepting custom React Aria ranges. Indeterminate mode is selected with `isIndeterminate`; RAC then omits `aria-valuenow` and exposes the correct progressbar semantics.

Progress indicators have no visible label in the Material component itself. Supply `aria-label` or `aria-labelledby` for a useful accessible name. Wavy drawing SVGs are `aria-hidden`; animation never mutates the semantic owner.

## Canonical geometry

The checked-in Style Dictionary source `packages/tokens/tokens/component/progress-indicator.json` owns the current component geometry and colors:

- standard linear: 4px height / active / track thickness, 4px track-active gap, 4px stop indicator.
- standard circular: 40px container and 4px active/track thickness.
- expressive linear: 10px wave container, 3px active-wave amplitude, 40px determinate wavelength, 20px indeterminate wavelength.
- expressive circular: 48px wave container, 1.6px active-wave amplitude, 15px wavelength.
- active/stop color uses primary; track uses secondary-container; current shapes are full.

The 240px default linear width is deliberately a runtime projection because AndroidX explicitly states that the width is specified but not tokenized. The Web 80px minimum width is likewise a renderer adaptation, not a fabricated DTCG token.

## Runtime behavior

Pinned AndroidX Compose revision `ff9a7111302243197384c499d5e3461c1804cd6e` is used for `WavyProgressIndicator.kt`, `ProgressIndicator.kt`, the component drawing helpers, `ProgressIndicatorTokens`, `LinearProgressIndicatorTokens`, `CircularProgressIndicatorTokens`, and `MotionTokens`. Compose supplies current wavy geometry, progress coercion, determinate amplitude lifecycle, zero-speed behavior, circular continuity, and indeterminate motion.

Current Material Web revision `cac97678831d48d4eb4a606ca50f92673a1dc20c` remains the audit pin for web renderer behavior. Standard progress keeps its existing Web adaptations; this wavy hardening does not rewrite standard indicators or canonical tokens.

## Wavy controls

Wavy indicators expose React/TypeScript-idiomatic runtime controls:

- `value`, `minValue`, `maxValue`, and `isIndeterminate` through React Aria progress semantics;
- `amplitude` as a numeric 0..1 multiplier (no Compose progress getter or amplitude lambda leaks into the public API);
- `wavelength` and `waveSpeed` in CSS pixels / CSS pixels per second;
- `color` and `trackColor` visual overrides;
- `thickness` and `trackThickness` numeric stroke-width overrides.

Determinate indicators use the Material default amplitude lifecycle when `amplitude` is omitted: flat through 10%, full wave above 10% through below 95%, then flat again. Indeterminate indicators default to full amplitude. Invalid numeric inputs are normalized; progress is clamped to its semantic range, NaN resolves safely to the minimum, amplitude is clamped to 0..1, and negative/invalid wavelength, speed, or thickness values cannot create invalid SVG geometry. `waveSpeed={0}` intentionally freezes wave phase in a valid state.

Circular wave generation selects an integral number of waves around the circumference, so full-circle paths meet without a visible phase seam. SVG view boxes plus non-scaling linear strokes preserve geometry when resized. `prefers-reduced-motion: reduce` disables CSS motion and SVG path interpolation while preserving a static valid indicator.

## Intentional boundaries

- No canonical token file is generated or mutated by this component.
- Buffer and four-color remain standard-progress Web adaptations; the wavy public APIs do not inherit those unrelated controls.
- Renderer-only dimensions and animation mechanics stay local rather than becoming synthetic tokens.
- No general-purpose chart/path library or new dependency is introduced.
