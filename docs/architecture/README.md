# Material 3 parity architecture

This repository ports Material 3 behavior and visuals from AndroidX Compose to React + TypeScript. The target is behavioral and visual parity where the concepts make sense on the web, not Kotlin source translation.

This document is the repository-level ownership contract. **Do not reopen the token/theme/runtime ownership model during ordinary component work.** Research upstream sources to discover Material facts, behavior, API capability, and parity drift; do not use differences in AndroidX implementation mechanics as a reason to redesign this boundary unless a concrete Material requirement or web-platform constraint cannot be satisfied by it.

Agents performing Material component/theme/token parity work must start with `/.agents/skills/material3-parity/SKILL.md`; root `AGENTS.md` defines the mandatory trigger scope. This README remains the canonical rationale behind that operating skill.

## Hard architectural invariants

These rules are intentionally strict where they define token source/build ownership. Component DOM shape, class names, wrapper choices, and paint plumbing are implementation details unless the Material contract itself requires a particular observable result.

1. `packages/tokens/tokens/**/*.json` is the **only authoritative immutable design-token source**.
2. Canonical tokens are manually reviewed DTCG. AndroidX, Figma Material 3, Material Web, and other upstreams are **read-only audit oracles**.
3. Style Dictionary is the only token build engine. It reads only canonical DTCG and emits the public typed JS artifacts plus explicitly reviewed platform adapters.
4. Upstream data must never generate, rewrite, or become an `include`/`source` input for canonical/runtime tokens.
5. Do not recreate `scripts/compose-sync`, `packages/tokens/src/generated/androidx`, or any equivalent upstream-to-runtime snapshot generator.
6. Dynamic Material colors belong to `ThemeProvider`. Core color-role tokens terminate in runtime CSS expressions such as `var(--primary)`; component color tokens alias those canonical roles.
7. Non-color design tokens are generated static values. They may be serialized into a consumer-specific generated CSS adapter, but must not become a generic global token-variable dump without a concrete platform need.
8. `packages/tokens` has no handwritten runtime `src/` layer. JavaScript consumers import immutable values from the package root. UI code may import generated CSS adapter subpaths exported by the token package.
9. Component/runtime code may contain behavior, interaction history, DOM geometry, and real runtime overrides, but must not duplicate or reserialize immutable design constants when Style Dictionary/CSS can own the platform representation.
10. Compose `FooDefaults`, token objects, `CompositionLocal`, `Dp`, and other Kotlin/runtime mechanisms are **semantic evidence, not mandatory TypeScript architecture**. Never add a web runtime layer merely to mirror an upstream symbol or call graph.
11. Immutable baseline theme data follows the same source/build rule as immutable component data. Existing handwritten baseline light/dark and typography serialization is migration debt, not precedent for adding more static theme tables in UI TypeScript.
12. A new upstream revision is adopted by reviewing canonical changes and audit drift; never by regenerating canonical files from upstream.

The token package checks its source/build boundaries in `packages/tokens/scripts/architecture.test.mjs`. Repository-specific Style Dictionary guidance lives in `/.agents/skills/style-dictionary/SKILL.md`.

## Why this architecture exists

Material 3 separates **component semantics** from the **active theme**. AndroidX Compose expresses that separation with runtime structures such as `MaterialTheme`, generated component token objects, and component `FooDefaults`. Material Web expresses much of the same semantic relationship through CSS custom properties. The browser additionally gives m3-ui a cascade and selector system that Compose does not have.

The repository therefore preserves the Material responsibility split while choosing web-native execution points:

```text
Material semantic fact
    -> canonical DTCG
    -> Style Dictionary
    -> generated web adapter
    -> browser CSS
```

and for runtime dynamic color:

```text
component semantic color token
    -> canonical system role
    -> var(--role)
    -> ThemeProvider concrete role value
```

This has several deliberate benefits:

- `sourceColor` can change every component color through scoped CSS variables without each component reading React Context or rerunning a color resolver;
- immutable design facts are compiled once instead of being reconstructed on every render;
- the token graph remains auditable against Compose/Figma/Material Web without any upstream becoming a runtime dependency;
- nested themes and themed portals work through the CSS cascade;
- React remains focused on behavior that actually requires runtime state;
- there is only one immutable semantic source and one platform compiler, avoiding drift between DTCG, `Foo.tokens.ts`, `Foo.defaults.ts`, and handwritten CSS.

A proposed abstraction that duplicates an existing layer must justify why the existing token/compiler/theme/CSS pipeline cannot express the required Material behavior.

## Closed decision: Compose `FooDefaults` versus m3-ui

Compose commonly has a runtime path like:

```text
MaterialTheme
    -> ButtonDefaults / TextFieldDefaults / SliderDefaults / ...
    -> component
```

That tells us which defaults and customization capabilities are part of the Material contract. It does **not** imply that m3-ui should port `ButtonDefaults.colors()`, `TextFieldColors`, or an equivalent TypeScript object when those values are immutable and already represented by canonical DTCG.

For immutable defaults, the m3-ui web path is:

```text
canonical component DTCG
    -> Style Dictionary
    -> generated component CSS
    -> handwritten structural/state CSS
    -> component
```

For component colors it is:

```text
canonical component color token
    -> canonical color.role.* token
    -> var(--role)
    -> ThemeProvider runtime scheme
```

This is the web equivalent of **static default resolution**. The browser does not need React to rebuild the same mapping.

Therefore:

- Compose `FooDefaults` is an **audit oracle for semantic defaults, variants, states, sizes, behavior, and customization capability**;
- public Compose API shape is not automatically a web public API requirement;
- a `Foo.defaults.ts` or `Foo.tokens.ts` file may exist only for real runtime work; its name does not grant permission to duplicate immutable token data;
- do not create `FooDefaults.colors()`/`FooColors` merely to return role mappings already encoded in DTCG;
- do not create a MUI-style `ThemeProvider.components` component-default registry;
- when a genuine runtime customization capability is missing, add the narrowest web-native prop/helper/CSS-variable contract that preserves Material semantics without bypassing the canonical token graph.

### Bad: a second static token compiler in React

```text
DTCG
  -> generated JS constants
  -> Foo.tokens.ts projection object
  -> Foo.defaults.ts
  -> inline --_foo-* CSS variables
  -> CSS
```

if every mapping in the middle is immutable.

### Good: compile immutable platform bindings once

```text
DTCG
  -> Style Dictionary
  -> generated foo.css
  -> handwritten structural CSS
```

while runtime TypeScript handles only values that actually depend on runtime information.

## Static-versus-runtime decision procedure

Use this procedure before placing any Material value in TypeScript:

1. **Is the value an immutable Material/design fact?**
   - variant/state color role;
   - dimension/spacing/minimum size;
   - typography role/metric;
   - default shape/radius;
   - state opacity;
   - static motion/easing/duration;
   - static outline or shadow recipe.

   If yes, make it canonical DTCG or an alias to canonical DTCG.

2. **Can CSS express the platform mapping without JavaScript-only information?**
   - selectors/data attributes;
   - CSS custom properties;
   - `calc()`;
   - `color-mix()`;
   - static variant/size/state matrices;
   - reviewed generated platform declarations.

   If yes, Style Dictionary/generated CSS owns the immutable binding. Handwritten CSS owns structure/layout and consumes the generated private variables.

3. **Does JavaScript require the value because runtime information is involved?**
   - current/previous interaction ordering;
   - runtime elevation-level selection;
   - DOM measurement;
   - pointer/ripple geometry;
   - timers/lifecycle;
   - runtime arithmetic that depends on props/current values/measurements;
   - user-supplied runtime overrides.

   If yes, TypeScript may consume generated tokens at that narrow runtime boundary.

4. **Is the value a concrete Material system color derived from runtime `sourceColor`, mode, or contrast?**

   If yes, `ThemeProvider` owns the concrete runtime value. Components consume it through canonical role CSS variables; they do not resolve the dynamic scheme themselves.

Examples:

| Material fact / behavior | Correct owner |
| --- | --- |
| Filled Button container maps to Primary | canonical component DTCG + generated CSS |
| TextField focused/error/disabled color matrix | canonical DTCG + generated CSS/state CSS |
| Static disabled color alpha or `color-mix()` | generated CSS when CSS can express it |
| Slider size-to-static geometry matrix | canonical DTCG + generated CSS |
| Current press/focus/hover precedence | React Aria/native state + runtime coordinator if needed |
| Previous interaction selects outgoing elevation motion | TypeScript runtime |
| Ripple origin/radius from pointer and bounds | TypeScript runtime |
| Surface tonal calculation from runtime absolute elevation/custom color | TypeScript/runtime CSS calculation as appropriate |
| User-supplied runtime pressed shape | typed prop + runtime override |
| Concrete `primary` generated from `sourceColor` | ThemeProvider |
| Immutable Material baseline light/dark scheme | canonical DTCG + generated baseline CSS/typed JS target |

A value being read from `@m3-ui/tokens` in TypeScript is not automatically wrong. Reading a token for genuine runtime arithmetic is valid. Reading a token only to stringify it into an inline CSS custom property is a strong sign that the component is acting as a handwritten platform compiler.

## Change-local implementation notes

Foundational subsystems keep research and ownership notes next to the code. Read the relevant notes before editing the subsystem and update them in the same PR when ownership, injection, runtime behavior, generated output, or an allowed escape hatch materially changes.

Relevant local notes:

- Material component/theme/token parity work: `/.agents/skills/material3-parity/SKILL.md`;
- token/compiler changes: `/.agents/skills/style-dictionary/SKILL.md` and `/packages/tokens/README.md`;
- elevation changes: `/packages/ui/src/internal/elevation/README.md`;
- ripple/state-layer/focus-indication changes: `/packages/ui/src/internal/ripple/README.md`;
- theme/runtime-color changes: `/packages/ui/src/theme/README.md`.

These notes are guidance, not executable contracts on component DOM structure, class names, wrappers, or exact wording. Tests should assert Material/token semantics and observable behavior directly instead of freezing the implementation chosen during one refactor with source-regex guards.

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

Lower layers must not depend on public components. Production code must never import from test fixtures. JavaScript/TypeScript token values come from the `@m3-ui/tokens` package root. A token CSS subpath import is valid when the token package exports that generated adapter; consistency tests verify generated outputs, package exports, and UI imports agree without maintaining a separate name allowlist.

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

1. Read `/.agents/skills/material3-parity/SKILL.md` and the applicable local implementation notes listed above.
2. Confirm the pinned AndroidX revision and inspect the relevant component, generated token files, Defaults/runtime resolution code, and tests.
3. Identify which values are true immutable tokens versus runtime behavior or web-only adaptation.
4. Add or update canonical DTCG manually under `packages/tokens/tokens/`; alias shared core tokens when semantic identity is genuinely shared.
5. Extend read-only AndroidX/Figma/Material Web audit mappings where a meaningful upstream counterpart exists. Compare semantic color/elevation/shape/typography identity rather than unrelated serialized representations.
6. Let Style Dictionary generate JS/`.d.ts` and any reviewed platform adapter; do not write a parallel TypeScript or ad-hoc CSS generator.
7. Keep runtime TypeScript limited to behavior/arithmetic that requires runtime information. Prefer CSS for immutable visual mappings.
8. Implement behavior with React Aria/native HTML and CSS-first visual states.
9. Update the local implementation notes when the responsibility boundary changes. Add tests for Material/token semantics or observable behavior affected by the change; do not add a source-regex guard merely to preserve an incidental implementation choice.
10. Add token/default/behavior/layout tests and Storybook visual regression coverage.
11. Document intentional web differences.

If an upstream value does not map cleanly to the web implementation, document the adaptation. Do not hide the mismatch by copying upstream structure into runtime code.

## Testing layers

Every substantial port should be covered by canonical validation, generated-output tests, read-only upstream audit where applicable, defaults/layout tests, interaction/accessibility tests, and Chromium Storybook visual regression. Expected test data must not be generated from the production resolver being tested.

## Review checklist

A component/token change is not ready until reviewers can answer yes to all relevant questions:

- Was `/.agents/skills/material3-parity/SKILL.md` read for Material component/theme/token parity work?
- Were the applicable local implementation notes read and updated if the boundary changed?
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
- Do validation, audit, test, typecheck, build, and visual regression pass?
