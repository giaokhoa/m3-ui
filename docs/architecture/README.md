# Material 3 parity architecture

This repository ports Material 3 behavior and visuals from AndroidX Compose to React + TypeScript. The target is behavioral and visual parity where the concepts make sense on the web, not Kotlin source translation.

## Hard architectural invariants

These rules are intentionally strict. They exist to prevent the token pipeline and interaction effects from drifting back toward older experiments.

1. `packages/tokens/tokens/**/*.json` is the **only authoritative immutable design-token source**.
2. Canonical tokens are manually reviewed DTCG. AndroidX, Figma Material 3, Material Web, and other upstreams are **read-only audit oracles**.
3. Style Dictionary is the only token build engine. It reads only canonical DTCG and emits the public typed JS artifacts plus explicitly reviewed platform adapters.
4. Upstream data must never generate, rewrite, or become an `include`/`source` input for canonical/runtime tokens.
5. Do not recreate `scripts/compose-sync`, `packages/tokens/src/generated/androidx`, or any equivalent upstream-to-runtime snapshot generator.
6. Dynamic Material colors belong to `ThemeProvider`. Core color-role tokens terminate in runtime CSS expressions such as `var(--primary)`; component color tokens alias those canonical roles.
7. Non-color design tokens are generated static values. They may be serialized into a consumer-specific generated CSS adapter, but must not become a generic global token-variable dump without a concrete platform need.
8. `packages/tokens` has no handwritten runtime `src/` layer. JavaScript consumers import immutable values from the package root. UI code may import only explicitly reviewed generated CSS adapter subpaths such as `@m3-ui/tokens/button.css`.
9. Component/runtime code may contain behavior, interaction history, DOM geometry, and real runtime overrides, but must not duplicate or reserialize immutable design constants when Style Dictionary/CSS can own the platform representation.
10. A new upstream revision is adopted by reviewing canonical changes and audit drift; never by regenerating canonical files from upstream.

The token package enforces these boundaries in `packages/tokens/scripts/architecture.test.mjs`. Repository-specific Style Dictionary rules live in `/.agents/skills/style-dictionary/SKILL.md`.

## Change-local documentation contract

Foundational subsystems own an architecture contract next to the code. **Read that contract before editing the subsystem.** When a change alters ownership, injection, runtime behavior, generated output, or an allowed escape hatch, update the local contract in the same PR and add or update an executable guard where practical.

Current required local contracts:

- token/compiler changes: `/.agents/skills/style-dictionary/SKILL.md` and `/packages/tokens/README.md`;
- elevation changes: `/packages/ui/src/internal/elevation/README.md`;
- ripple/state-layer/focus-indication changes: `/packages/ui/src/internal/ripple/README.md`;
- theme/runtime-color changes: `/packages/ui/src/theme/README.md`.

A local README is not merely explanatory documentation. It is part of the architecture contract. Architecture tests should assert the important semantic rules so stale documentation or a future AI refactor cannot silently restore a forbidden pattern.

## What “1:1” means

A component is considered parity-complete when the web implementation matches the relevant Material contract for public variants/defaults, semantic color roles, interaction states, layout metrics, minimum sizes, spacing, shape, elevation, state layers, controlled/uncontrolled behavior where applicable, web accessibility semantics, equivalent-theme visual output, and documented edge cases.

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
                  ┌────────────────┼────────────────┐
                  ▼                ▼                ▼
             tokens.js        tokens.d.ts     platform CSS
                  │                                 │
                  └──────────────┬──────────────────┘
                                 ▼
                       @m3-ui/tokens consumers
```

AndroidX revision and file mappings live only in audit code under `packages/tokens/scripts/androidx/` and `packages/tokens/scripts/audit-androidx.mjs`. Audit code may fetch and parse pinned upstream files in memory; it has no renderer/write path into canonical tokens.

## Dependency direction

```text
canonical DTCG
    ↓
Style Dictionary generated @m3-ui/tokens outputs
    ↓
theme foundations / internal primitives / generated component adapters
    ↓
component behavior + structural CSS
    ↓
public components
    ↓
apps / consumers
```

Lower layers must not depend on public components. Production code must never import from test fixtures. JavaScript/TypeScript token values come from the `@m3-ui/tokens` package root. A token subpath import is allowed only when it is an explicit generated platform adapter declared in the token package exports and architecture allowlist.

## Dynamic colors and CSS variables

`ThemeProvider` owns the runtime color scheme. It maps semantic roles such as `primary`, `onPrimary`, and `surfaceContainerHigh` to CSS custom properties on the provider scope.

Core runtime-role endpoints are strings:

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

A component that uses Primary aliases the role:

```json
{
  "containerColor": {
    "$type": "string",
    "$value": "{color.role.primary}"
  }
}
```

The intended chain is:

```text
component semantic token
    -> color.role.primary
    -> var(--primary)
    -> ThemeProvider concrete runtime value
```

Do not turn runtime semantic roles into fake concrete DTCG colors. Do not copy `var(--primary)` into component tokens when a canonical role exists. Do not decode a `var(--role)` string in TypeScript to recover semantic identity and then reconstruct it later.

## Static platform styling and runtime behavior

Static visual defaults should reach the browser without a React serialization hop when a reviewed CSS adapter can express them:

```text
DTCG -> Style Dictionary -> generated platform CSS -> handwritten structural CSS
```

Generated adapters stay centralized under `packages/tokens/dist/generated/` and are package exports when a UI consumer needs them. Handwritten component CSS consumes private component/internal variables and owns layout/structure; generated CSS owns immutable token-to-platform bindings.

React/TypeScript remains responsible for values that genuinely require runtime information, including:

- interaction precedence/history;
- choosing an elevation level from current interaction state;
- runtime transition precedence where previous interaction matters;
- ripple wave geometry and lifecycle;
- DOM measurements;
- user-supplied runtime shape or style overrides.

React/TypeScript must not become a platform compiler for static box-shadow recipes, state-layer opacities, motion constants, focus-ring constants, component colors, dimensions, or typography when those can be generated once.

## Interaction effects

React Aria/native DOM semantics are the source of web interaction events. Material interaction state may coordinate multiple effects, but each effect keeps a narrow rendering responsibility:

- elevation: runtime selects semantic level; generated CSS paints canonical shadow geometry;
- ripple: runtime owns wave geometry/lifecycle; generated CSS owns immutable motion/state-layer/focus-ring styling;
- focus visibility: use React Aria/platform focus-visible semantics rather than duplicating browser modality logic.

Do not create a second independent event state machine inside ripple when the host component already receives normalized React Aria press/hover/focus events. Do not collapse elevation, ripple, focus ring, and component content into a monolithic effect abstraction when their paint bounds differ.

## Compose → web mapping

| Compose concept | TypeScript/web equivalent |
| --- | --- |
| `@Composable` | React function component |
| content lambda | `ReactNode` or typed render prop |
| `MaterialTheme.colorScheme` | ThemeProvider + CSS custom properties |
| visual `CompositionLocal` | CSS cascade where appropriate |
| behavioral `CompositionLocal` | React Context only when JS access is required |
| `Color` | CSS color string / semantic runtime role |
| `Dp` | generated CSS length or UI-local numeric projection at arithmetic boundary |
| `Shape` | generated shape token / CSS radius |
| `TextStyle` | generated typography values mapped to CSS |
| `Modifier` | props + class names + CSS layout |
| `MutableInteractionSource` | React Aria/native interaction state plus a small shared coordinator only when ordering/history is required |
| semantics / `Role` | native element semantics + ARIA |
| `Color.Unspecified` | `undefined` |
| Kotlin `copy(...)` | object spread / pure factory override |

## Component workflow

Before implementing or substantially refactoring a component family:

1. Read the applicable local architecture contracts listed above.
2. Confirm the pinned AndroidX revision and inspect the relevant component, generated token files, Defaults/runtime resolution code, and tests.
3. Identify which values are true immutable tokens versus runtime behavior or web-only adaptation.
4. Add or update canonical DTCG manually under `packages/tokens/tokens/`; alias shared core tokens when semantic identity is genuinely shared.
5. Extend read-only AndroidX/Figma/Material Web audit mappings where a meaningful upstream counterpart exists. Compare semantic color/elevation/shape/typography identity rather than unrelated serialized representations.
6. Let Style Dictionary generate JS/`.d.ts` and any reviewed platform adapter; do not write a parallel TypeScript or ad-hoc CSS generator.
7. Keep runtime TypeScript limited to behavior/arithmetic that requires runtime information. Prefer CSS for immutable visual mappings.
8. Implement behavior with React Aria/native HTML and CSS-first visual states.
9. Update the local architecture contract when the responsibility boundary changes, and add a guard that fails on the regression you are removing.
10. Add token/default/behavior/layout tests and Storybook visual regression coverage.
11. Document intentional web differences.

If an upstream value does not map cleanly to the web implementation, document the adaptation. Do not hide the mismatch by copying upstream structure into runtime code.

## Testing layers

Every substantial port should be covered by canonical validation, generated-output tests, read-only upstream audit where applicable, architecture guards, defaults/layout tests, interaction/accessibility tests, and Chromium Storybook visual regression. Expected test data must not be generated from the production resolver being tested.

## Review checklist

A component/token change is not ready until reviewers can answer yes to all relevant questions:

- Were the applicable local architecture contracts read and updated if the boundary changed?
- Is every immutable design value canonical DTCG or a deliberate runtime-derived value?
- Does Style Dictionary remain the sole token/platform build engine?
- Are generated CSS adapters explicit, consumer-driven, and centralized under token build output?
- Are upstream sources read-only and pinned?
- Do component colors alias canonical runtime roles rather than duplicate CSS expressions?
- Does `ThemeProvider` remain the owner of concrete runtime Material colors?
- Are React/TypeScript projections limited to genuine runtime behavior/arithmetic?
- Are React Aria/native semantics used where available?
- Are audit/test fixtures independent from production output?
- Are intentional web adaptations documented?
- Is there an executable guard against the architectural regression being removed?
- Do validation, audit, test, typecheck, build, and visual regression pass?
