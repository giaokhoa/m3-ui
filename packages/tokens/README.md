# Tokens

Target publish scope: `@m3-ui/tokens`. The workspace keeps `@m3-ui/tokens` until the repository-wide namespace migration is done atomically.

## Source of truth

`tokens/**/*.json` is the only authoritative immutable design-token source. Canonical files use plain DTCG `$type` / `$value` and are split by semantic ownership.

```text
tokens/
├── core/
│   ├── color.json
│   ├── state.json
│   ├── elevation.json
│   ├── shape.json
│   ├── typography.json
│   ├── motion.json
│   └── ripple.json
└── component/
    ├── button/
    ├── card.json
    ├── checkbox.json
    ├── chip/
    ├── text-field/
    ├── radio-button.json
    ├── switch.json
    └── ...
```

Style Dictionary deep-merges these files into one graph. Duplicate canonical paths are rejected. AndroidX Compose, the Material 3 Figma Design Kit, Material Web, Material Components Android, Flutter Material, and other upstreams are read-only references; audit evidence never becomes a build input.

This is intentionally a **single-source build / multi-reference audit** architecture.

## Closed ownership decision: Compose Defaults are not a second token layer

This decision is repository architecture and should not be re-researched for every component migration.

AndroidX Compose commonly has this runtime shape:

```text
MaterialTheme -> FooDefaults -> Foo component
```

That shape is appropriate for Compose runtime. It tells us important Material semantics: which default color roles, dimensions, shapes, typography, elevations, states, variants, and customization capabilities a component has. It does **not** require the web implementation to create a TypeScript `FooDefaults` object.

m3-ui has a compile-time token/platform layer plus the browser CSS cascade:

```text
canonical component DTCG
    -> Style Dictionary
    -> generated component CSS
    -> handwritten structural/state CSS
    -> component

component color DTCG
    -> canonical runtime role
    -> var(--role)
    -> ThemeProvider concrete runtime value
```

For immutable values, this pipeline is the web equivalent of the static-default resolution that Compose performs through token objects/`FooDefaults` at runtime.

Therefore:

- do **not** add `FooDefaults.colors()`, `FooColors`, `Foo.tokens.ts`, or `Foo.defaults.ts` merely to reshape generated tokens into CSS variables;
- do **not** duplicate a fact in TypeScript when the same fact is already represented by canonical DTCG;
- do **not** treat a public Compose `FooDefaults` symbol as evidence that the same API shape must exist on the web;
- do preserve the observable Material semantics and real customization capability represented by Compose, using the narrowest web-native mechanism that fits;
- a component-local runtime helper is valid when it resolves genuine runtime information, not when it acts as a second token compiler.

The default rendering path for immutable styling is always intended to avoid a React serialization hop.

## Static-versus-runtime classification

Before adding a token read to component TypeScript, classify the value with this procedure:

1. **Is it an immutable Material/design fact?** Examples: variant/state color role, size, spacing, shape, typography, state opacity, static motion value, outline width, elevation recipe. If yes, it belongs in canonical DTCG.
2. **Can the browser express the mapping without information that only exists at runtime?** If selectors, attributes, custom properties, `calc()`, `color-mix()`, or a reviewed CSS adapter can express it, Style Dictionary/generated CSS owns the platform binding.
3. **Does JavaScript need the numeric/string token for runtime arithmetic or behavior?** Examples: DOM measurement, runtime geometry, interaction ordering/history, current/previous interaction selection, ripple wave lifetime, timers, user-supplied runtime override. If yes, TypeScript may consume the generated token value at that narrow boundary.
4. **Is the value a concrete dynamic Material system color derived from `sourceColor`, mode, or contrast?** If yes, `ThemeProvider` owns that runtime value and components consume it through canonical role CSS variables.

Examples:

| Fact | Owner |
| --- | --- |
| Filled Button container uses Primary | canonical component DTCG + generated CSS |
| Disabled Card container alpha/blend | canonical tokens + generated CSS when CSS can express it |
| Slider size-to-static geometry matrix | canonical DTCG + generated CSS |
| Current press/focus/hover precedence | React/React Aria runtime |
| Previous interaction used to select outgoing elevation motion | TypeScript runtime |
| Ripple origin/radius from pointer and DOM bounds | TypeScript runtime |
| User-provided runtime shape override | TypeScript/runtime CSS override |
| Concrete `primary` produced from runtime `sourceColor` | ThemeProvider |

A file name such as `*.defaults.ts` or `*.tokens.ts` does not make static projection legitimate. Ownership is determined by whether the value truly needs runtime information.

## Runtime color architecture

`ThemeProvider` owns the actual runtime Material color scheme. It emits scoped CSS custom properties such as `--primary`, `--on-primary`, `--surface`, `--outline`, and `--shadow` from the active baseline or dynamic Material Color Utilities scheme.

Style Dictionary does **not** own the concrete runtime color values. It owns the semantic relationship between component/effect tokens and runtime roles.

Core color roles terminate in runtime CSS expressions:

```json
{
  "color": {
    "role": {
      "primary": {
        "$type": "string",
        "$value": "var(--primary)"
      }
    }
  }
}
```

Component/effect colors must alias those canonical roles rather than copy the CSS expression:

```json
{
  "containerColor": {
    "$type": "string",
    "$value": "{color.role.primary}"
  }
}
```

The intended chain is therefore:

```text
component/effect token
    -> canonical runtime color role
    -> var(--role)
    -> ThemeProvider concrete runtime value
```

This mirrors the Material 3 responsibility split: component defaults point to semantic/system roles while the active theme resolves those roles.

### Why canonical roles currently terminate in `var(--role)`

A CSS `var(...)` endpoint is web-specific, so it is a deliberate platform choice rather than an accidental DTCG convention. `@m3-ui/tokens` currently serves this web implementation, and terminating semantic color roles in CSS expressions gives the browser a direct, cascade-friendly runtime endpoint without adding another handwritten role-name mapping layer.

Keep this choice while the token package is web-targeted. If the canonical token package later becomes a true multi-platform source that must emit independent Android/iOS/Flutter role bindings, reconsider separating platform-neutral role identity from the web CSS endpoint at that time. Do not add that abstraction preemptively.

Do not replace runtime roles with static hex placeholders. Do not duplicate `var(--role)` in component/effect tokens when the role already exists. UI code must not decode `var(--role)` into a semantic name and reconstruct it later.

## Style Dictionary outputs

Style Dictionary 5.5.2 is the build engine. The generated package root remains the typed JS/TypeScript token vocabulary:

```text
dist/generated/tokens.js
dist/generated/tokens.d.ts
```

The token package has no handwritten runtime `src/` layer.

Platform-specific generated CSS artifacts are allowed only when they have concrete consumers. Current reviewed adapters are centralized together:

```text
dist/generated/button.css
dist/generated/chip.css
dist/generated/text-field.css
dist/generated/elevation.css
dist/generated/ripple.css
```

They are exported as:

```text
@m3-ui/tokens/button.css
@m3-ui/tokens/chip.css
@m3-ui/tokens/text-field.css
@m3-ui/tokens/elevation.css
@m3-ui/tokens/ripple.css
```

Generated adapters serialize immutable token-to-platform bindings. They do not generate a dynamic Material color scheme and must not define the runtime value of ThemeProvider-owned roles such as `--primary`, `--secondary`, or `--shadow`.

The reviewed adapter set is intentionally incomplete while the repository migrates older components. **Existing handwritten token/default serializers are migration debt, not examples to copy.** New or migrated components should follow Button/TextField unless they can demonstrate a genuine runtime need.

The goal is to avoid this runtime-only projection pattern:

```text
DTCG -> flat JS constants -> handwritten projection table -> inline CSS vars/box-shadow
```

for values that can be compiled once into static platform CSS.

JavaScript projections remain appropriate only when JavaScript genuinely needs the value for behavior, arithmetic, interaction history, DOM geometry, timers/lifecycle, or user-supplied runtime overrides.

## Static baseline foundation target

The same compile-once rule applies to immutable theme foundations. The current UI implementation still keeps the baseline light/dark Material color maps in `packages/ui/src/theme/baseline.ts` and constructs baseline typography CSS variables in TypeScript. Those are known migration debt.

The target is:

```text
immutable baseline light/dark + baseline typography
    -> canonical DTCG
    -> Style Dictionary
    -> generated baseline foundation CSS + typed JS

runtime sourceColor/mode/contrast override
    -> ThemeProvider
    -> scoped runtime role overrides
```

This does **not** move dynamic theme generation into Style Dictionary. `ThemeProvider` remains the owner of concrete runtime dynamic colors. It only removes needless React serialization for immutable baseline data and ensures the baseline has the same canonical source/build discipline as component tokens.

Do not use the current handwritten baseline files as precedent for adding more immutable theme tables in UI TypeScript.

## Button reference slice

Button established the component-token adapter pattern:

```text
canonical Button tokens
    -> Style Dictionary
    -> dist/generated/button.css
    -> handwritten Button structural CSS
```

Static ownership includes baseline geometry, variant color/outline mapping, expressive sizes, typography metrics, icon dimensions/spacing, and default radius.

Runtime TypeScript keeps interaction precedence/history, elevation level/transition selection, and user-supplied pressed-shape behavior. Button now renders the shared `<Elevation>` primitive rather than serializing the canonical shadow recipe into its root inline style.

Connected ButtonGroup now selects semantic elevation levels on its existing React Aria `label` / `button` hosts and consumes the generated elevation adapter without adding wrapper-only paint structure.

## Chip color slice

Chip follows the same semantic color boundary without moving genuinely runtime geometry into the compiler:

```text
canonical Chip color tokens
    -> {color.role.*}
    -> Style Dictionary
    -> dist/generated/chip.css
    -> handwritten Chip structural CSS
```

The generated adapter owns the immutable enabled/disabled and selected/unselected container, content, icon, outline, and disabled-alpha mappings. `ThemeProvider` still owns the actual values of `--on-surface`, `--primary`, `--secondary-container`, and the other runtime roles.

Chip TypeScript retains interaction/elevation behavior, callsite-dependent shapes, expressive shape transitions, slot-dependent padding/spacing, and avatar opacity. It must not decode runtime CSS expressions or rebuild static `color-mix(...)` values.

## TextField full static slice

TextField has no runtime need for its immutable base-default projection, so the compiler owns the complete shared + filled/outlined matrix:

```text
canonical TextField tokens
    -> semantic DTCG aliases / immutable values
    -> Style Dictionary
    -> dist/generated/text-field.css
    -> handwritten TextField structural/state CSS
```

That generated adapter owns shared dimensions, typography, motion, colors, disabled opacity, and the filled/outlined padding, shape, indicator/outline, and color defaults. `ThemeProvider` still resolves the actual runtime color roles; React Aria and CSS still own focus, invalid, disabled, read-only, value/placeholder, and form-state behavior.

The old `TextField.tokens.ts` / `TextField.defaults.ts` chain was pure static reshaping and is intentionally deleted. New code must not recreate a `DTCG -> colorRole() -> roleVariable() -> inline CSS vars` middleware for TextField or any other component.

## Elevation adapter

```text
canonical elevation levels + shadow layers
    -> Style Dictionary
    -> dist/generated/elevation.css
    -> <Elevation data-elevation="levelN">
    -> handwritten internal/elevation/elevation.css
```

React chooses the semantic level from runtime interaction state. Style Dictionary serializes the immutable shadow geometry/opacities. The generated adapter defaults its private shadow color to `var(--shadow)`; `ThemeProvider` supplies the concrete role value.

The canonical three-layer shadow recipe is intentionally preserved. Pinned Figma/Material Web evidence currently uses a different two-layer web renderer recipe; this remains tracked cross-source drift and must not be silently resolved by a formatter change. See `packages/ui/src/internal/elevation/README.md` and `scripts/elevation-reference-evidence.test.mjs`.

## Ripple adapter

```text
canonical ripple/state/focus-ring tokens
    -> Style Dictionary
    -> dist/generated/ripple.css
    -> <Ripple>
    -> handwritten internal/ripple/ripple.css
```

Generated CSS owns immutable state-layer opacities, motion/easing values, and focus-ring stroke/inset/color/motion bindings. `useRipple()` retains runtime geometry, measurement, active-wave lifetime, and release scheduling.

Ripple focus-ring colors alias canonical `Secondary` / `OnSecondary` roles; the core role endpoints resolve those aliases to ThemeProvider CSS variables.

## Public modular style self-containment

`@m3-ui/ui/styles/*.css` exports remain self-contained. The UI style build expands shared primitive dependencies so generated adapters are inlined before the handwritten CSS that consumes their private variables.

This build composition does not move generated files out of the token package. Generated artifacts remain centralized under `packages/tokens/dist/generated/`.

## Change-local implementation notes

Before changing a foundation, read the matching notes:

- token/compiler boundary: `/.agents/skills/style-dictionary/SKILL.md` and this README;
- repository-wide architecture: `/docs/architecture/README.md`;
- component boundary: the relevant component README, including `/packages/ui/src/components/TextField/README.md` when changing TextField;
- elevation: `/packages/ui/src/internal/elevation/README.md`;
- ripple/state layer/focus indication: `/packages/ui/src/internal/ripple/README.md`;
- runtime theme/color ownership: `/packages/ui/src/theme/README.md`.

If ownership, injection, generated output, runtime responsibilities, or an escape hatch changes, update the relevant notes in the same PR. These notes guide implementation and review; they do not require a source-regex guard for incidental DOM, class, wrapper, or paint choices.

### Agent preflight

Before researching upstream implementation for a component, first classify the task using the ownership rules above. Research AndroidX/Figma/Material Web for **Material facts, behavior, parity drift, and evidence**. Do not reopen the token/theme ownership model merely because an upstream implementation uses a different runtime abstraction.

Only propose changing this ownership model when there is a concrete Material requirement or platform constraint that the documented model cannot satisfy. In that case, document the contradiction and its evidence explicitly before changing architecture.

## Upstream audit

Upstreams remain audit oracles only:

```text
AndroidX / Figma / Material Web / other references
                  |
                  v
          normalize/read in memory
                  |
                  v
          compare with canonical DTCG
```

Reference snapshots, source pins, drift manifests, and audit scripts remain outside `tokens/**/*.json`. Cross-source disagreement is preserved as explicit drift evidence rather than silently rewriting canonical values.

Runtime colors are audited by semantic role identity first. Baseline light/dark and contrast evidence may additionally compare concrete values when the upstream owns the same scheme.

## Forbidden regressions

Do not reintroduce:

- `packages/tokens/src/` or handwritten token facades;
- upstream files as Style Dictionary `source` / `include`;
- generators that rewrite canonical DTCG from external sources;
- static hex placeholders for ThemeProvider-owned runtime roles;
- duplicated component/effect `var(--role)` strings instead of aliases;
- decode/re-encode helpers for runtime color expressions;
- generic global CSS-variable dumps for every immutable token without a real consumer;
- new React serializers for static component colors/dimensions/typography/motion, elevation shadow geometry, or Ripple styling constants;
- `FooDefaults.colors()`/`FooColors` facades whose only purpose is to reproduce static canonical mappings;
- handwritten `Foo.tokens.ts` projection tables for immutable defaults when generated adapters can express them;
- a `ThemeProvider.components`/MUI-style component default registry;
- handwritten design constants where a canonical token exists;
- hand-edited generated output;
- replacing runtime dynamic Material color generation with a build-time DTCG resolver.

## Validation and audit commands

- `pnpm --filter @m3-ui/tokens validate`
- `pnpm --filter @m3-ui/tokens test`
- `pnpm --filter @m3-ui/tokens audit:androidx`
- `pnpm --filter @m3-ui/tokens exec node scripts/audit-material-web-declaration-module-coverage.mjs --require-complete`
- `pnpm --filter @m3-ui/tokens exec node scripts/audit-drift-registry.mjs --require-complete`
- `pnpm --filter @m3-ui/tokens exec node scripts/audit-figma-reference.mjs --require-complete`
- `pnpm --filter @m3-ui/tokens exec node --test scripts/figma-color-scheme.test.mjs`
- `pnpm --filter @m3-ui/tokens exec node --test scripts/figma-color-contrast.test.mjs`
- `pnpm --filter @m3-ui/tokens exec node --test scripts/motion-reference-evidence.test.mjs`
- `pnpm --filter @m3-ui/tokens exec node --test scripts/elevation-reference-evidence.test.mjs`

See the local implementation notes above before changing token/theme/effect boundaries.
