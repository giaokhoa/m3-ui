# Progress Indicator

Material 3 progress indicators mapped to the canonical `@m3/tokens` Style Dictionary graph, React Aria `ProgressBar` semantics, pinned AndroidX Compose runtime behavior, and current Material Web web adaptations.

## Public family

- `LinearProgressIndicator`
- `CircularProgressIndicator`
- `LinearWavyProgressIndicator`
- `CircularWavyProgressIndicator`

All four use React Aria Components `ProgressBar` as the semantic owner. The Material wrapper defaults to the Material/Compose/Web 0..1 value range (`minValue=0`, `maxValue=1`) while still accepting custom React Aria ranges. Indeterminate mode is selected with `isIndeterminate`; RAC then omits `aria-valuenow` and exposes the correct progressbar semantics.

Progress indicators have no visible label in the Material component itself. Supply `aria-label` or `aria-labelledby` for a useful accessible name.

## Canonical geometry

The checked-in Style Dictionary source owns the current component geometry and colors:

- standard linear: 4px height / active / track thickness, 4px track-active gap, 4px stop indicator.
- standard circular: 40px container and 4px active/track thickness.
- expressive linear: 10px wave container, 3px active-wave amplitude, 40px determinate wavelength, 20px indeterminate wavelength.
- expressive circular: 48px wave container, 1.6px active-wave amplitude, 15px wavelength.
- active/stop color uses primary; track uses secondary-container; current shapes are full.

The 240px default linear width is deliberately a runtime projection because AndroidX explicitly states that the width is specified but not tokenized. The Web 80px minimum width is likewise a renderer adaptation, not a fabricated DTCG token.

## Runtime behavior

Pinned AndroidX Compose revision `ff9a7111302243197384c499d5e3461c1804cd6e` is used for current standard/wavy geometry, wavy amplitude behavior, semantic ranges, and current circular indeterminate motion. Compose's default determinate wavy amplitude is flat through 10%, wavy from >10% through <95%, then flat again.

Current Material Web revision `cac97678831d48d4eb4a606ca50f92673a1dc20c` is used for web-specific behavior that React consumers need:

- linear determinate 250ms transform motion and indeterminate primary/secondary bar animation;
- circular determinate 500ms decelerating stroke motion and the current 5332ms four-color cycle;
- optional `fourColor` indeterminate rendering;
- optional linear `bufferValue` rendering;
- the sourced 250ms determinate renderer transition and 80px minimum web width.

`fourColor` uses Material Web's documented default role sequence: primary, primary-container, tertiary, tertiary-container. These are existing canonical core color roles; no extra component tokens are invented.

## Wavy controls

Wavy indicators accept `amplitude`, `wavelength`, and `waveSpeed`. `amplitude` may be a 0..1 number or a function of normalized progress. `wavelength` and `waveSpeed` are CSS-pixel runtime controls matching the Compose API model; defaults come from canonical component tokens and one wavelength per second.

## Intentional boundaries

- No canonical token file is generated or mutated by this component.
- Buffer is a Web-only visual adaptation and is not assigned synthetic progress semantics beyond the primary value owned by RAC.
- Four-color is an indeterminate Web adaptation and does not alter the progressbar accessibility model.
- Runtime animation constants that are not Material tokens remain local renderer constants with their pinned source documented above.
