# Material 3 parity architecture

This repository ports Material 3 behavior and visuals from AndroidX Compose to React + TypeScript. The target is behavioral and visual parity where the concepts make sense on the web, not Kotlin source translation.

## Hard architectural invariants

These rules are intentionally strict. They exist to prevent the token pipeline from drifting back toward older experiments.

1. `packages/tokens/tokens/**/*.json` is the **only authoritative immutable design-token source**.
2. Canonical tokens are manually reviewed DTCG. AndroidX, Figma Material 3, Material Web, and other upstreams are **read-only audit oracles**.
3. Style Dictionary is the only token build engine. It reads only canonical DTCG and emits the public JS + TypeScript declaration artifacts.
4. Upstream data must never generate, rewrite, or become an `include`/`source` input for canonical/runtime tokens.
5. Do not recreate `scripts/compose-sync`, `packages/tokens/src/generated/androidx`, or any equivalent upstream-to-runtime snapshot generator.
6. Dynamic Material colors belong to `ThemeProvider`; canonical component color tokens contain runtime strings such as `var(--primary)`, not static hex fallbacks.
7. Non-color design tokens are generated static values, not global CSS variables. An explicit runtime theme override such as font-family is a theme concern, not token transport.
8. `packages/tokens/src/*.ts` may exist only as compatibility/projection facades. They may reshape generated values or convert CSS lengths/durations for arithmetic, but may not own immutable design values.
9. Component code may contain runtime behavior and derived calculations, but must not duplicate canonical token constants.
10. A new upstream revision is adopted by reviewing canonical changes and audit drift; never by regenerating canonical files from upstream.

The token package enforces the most important invariants in `packages/tokens/scripts/architecture.test.mjs`. Repository-specific Style Dictionary rules live in `/.agents/skills/style-dictionary/SKILL.md`.

## What “1:1” means

A component is considered parity-complete when the web implementation matches the relevant Material contract for:

- public variants and defaults;
- semantic color-role mapping;
- enabled, disabled, hovered, pressed, focused, selected, error, and related states;
- layout metrics, minimum sizes, spacing, shape, elevation, and state layers;
- controlled/uncontrolled behavior where a web equivalent exists;
- accessibility semantics translated to native HTML/ARIA conventions;
- visual output for equivalent theme inputs;
- documented edge cases and relevant upstream regression behavior.

Parity does **not** mean reproducing Compose runtime abstractions. Do not port `Modifier`, `@Composable`, `CompositionLocal`, Kotlin data classes, `Dp` wrappers, or `MutableInteractionSource` literally when React, CSS, the DOM, or React Aria already provide the correct web abstraction.

## Source-of-truth flow

```text
AndroidX Compose ─┐
Figma M3 Kit ─────┼── read-only normalize + semantic diff
Material Web ─────┘                ▲
                                   │
                         tokens/**/*.json
                         CANONICAL / REVIEWED
                                   │
                                   ▼
                            Style Dictionary
                                   │
                         ┌─────────┴─────────┐
                         ▼                   ▼
                    tokens.js          tokens.d.ts
                         │
                         ▼
              projections / UI consumers
```

AndroidX revision and file mappings live only in audit code under `packages/tokens/scripts/androidx/` and `packages/tokens/scripts/audit-androidx.mjs`. Audit code may fetch and parse pinned upstream files in memory; it has no renderer/write path into canonical tokens.

## Dependency direction

```text
canonical DTCG
    ↓
Style Dictionary generated API
    ↓
optional token projection facades
    ↓
theme foundations / internal primitives
    ↓
component defaults
    ↓
public components
    ↓
apps / consumers
```

Lower layers must not depend on public components. Production code must never import from test fixtures.

## Dynamic colors and CSS variables

`ThemeProvider` owns the runtime color scheme. It maps semantic roles such as `primary`, `onPrimary`, and `surfaceContainerHigh` to CSS custom properties on the provider scope.

Canonical dynamic colors are strings:

```json
{
  "containerColor": {
    "$type": "string",
    "$value": "var(--primary)"
  }
}
```

Do not turn runtime semantic roles into fake concrete DTCG colors. Do not generate a generic CSS variables stylesheet for dimensions, typography, motion, elevation, opacity, or other immutable values.

## Compose → web mapping

| Compose concept | TypeScript/web equivalent |
| --- | --- |
| `@Composable` | React function component |
| content lambda | `ReactNode` or typed render prop |
| `MaterialTheme.colorScheme` | ThemeProvider + CSS custom properties |
| visual `CompositionLocal` | CSS cascade where appropriate |
| behavioral `CompositionLocal` | React Context only when JS access is required |
| `Color` | CSS color string / semantic runtime role |
| `Dp` | generated CSS length or numeric projection at arithmetic boundary |
| `Shape` | generated shape token / CSS radius |
| `TextStyle` | generated typography values mapped to CSS |
| `Modifier` | props + class names + CSS layout |
| `MutableInteractionSource` | React Aria/native interaction state |
| semantics / `Role` | native element semantics + ARIA |
| `Color.Unspecified` | `undefined` |
| Kotlin `copy(...)` | object spread / pure factory override |

## Component workflow

Before implementing a new component family:

1. Confirm the pinned AndroidX revision and inspect the relevant component, generated token files, Defaults/runtime resolution code, and tests.
2. Identify which values are true immutable tokens versus runtime behavior or web-only adaptation.
3. Add or update canonical DTCG manually under `packages/tokens/tokens/`; alias shared core tokens when semantic identity is genuinely shared.
4. Extend read-only AndroidX/Figma audit mappings where a meaningful upstream counterpart exists. Compare semantic color/elevation/shape/typography identity rather than unrelated serialized representations.
5. Let Style Dictionary generate JS and `.d.ts`; do not write a parallel TypeScript generator.
6. Consume generated values directly or through a projection facade with no design literals.
7. Implement behavior with React Aria/native HTML and CSS-first visual states.
8. Add token/default/behavior/layout tests and Storybook visual regression coverage.
9. Document intentional web differences.

If an upstream value does not map cleanly to the web implementation, document the adaptation. Do not hide the mismatch by copying upstream structure into runtime code.

## Testing layers

Every substantial port should be covered by:

- **canonical validation** — DTCG shape, aliases, duplicates, cycles and supported types;
- **generated-output tests** — real pinned Style Dictionary JS/TS output;
- **read-only upstream audit** — semantic comparison against pinned AndroidX/Figma references where applicable;
- **defaults/layout tests** — independent expected behavior and dimensions;
- **interaction/accessibility tests** — React Aria/native semantics;
- **Chromium visual regression** — covered Storybook states.

Expected test data must not be generated from the production resolver being tested.

## Review checklist

A component/token change is not ready until reviewers can answer yes to all relevant questions:

- Is every immutable design value canonical DTCG or a deliberate runtime-derived value?
- Does Style Dictionary remain the sole token build engine?
- Are upstream sources read-only and pinned?
- Are dynamic colors runtime CSS-role references rather than static hex fallbacks?
- Are non-color design tokens kept out of generic global CSS variables?
- Are token projection facades free of design literals?
- Are React Aria/native semantics used where available?
- Are audit/test fixtures independent from production output?
- Are intentional web adaptations documented?
- Do validation, audit, test, typecheck, build, and visual regression pass?
