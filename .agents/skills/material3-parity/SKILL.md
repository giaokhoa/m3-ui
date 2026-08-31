---
name: material3-parity
description: Use for any Material 3 component parity work in @m3-ui/ui, including component implementation/refactors, defaults, tokens, ThemeProvider, generated CSS, React Aria behavior, accessibility, elevation/ripple, public API audits, or issue #150 migration work. Read this before deciding where Material defaults or runtime behavior belong.
---

# Material 3 parity

This skill is the mandatory architecture entrypoint for Material 3 component/theme/token parity work in this repository.

The repository-level rationale lives in `/docs/architecture/README.md`. Token/compiler details live in `/packages/tokens/README.md` and `/.agents/skills/style-dictionary/SKILL.md`. Theme details live in `/packages/ui/src/theme/README.md`. Issue #150 is the current static-default migration tracker.

## Start protocol

Before changing a Material component, component token/default layer, ThemeProvider, generated component CSS, elevation/ripple, or parity-facing public API:

1. Read `/docs/architecture/README.md`.
2. Read the relevant local README for the subsystem/component if one exists.
3. If tokens, Style Dictionary, generated CSS, or token ownership are involved, also read `/.agents/skills/style-dictionary/SKILL.md` and `/packages/tokens/README.md`.
4. If theme/color ownership is involved, read `/packages/ui/src/theme/README.md`.
5. If working from issue #150, treat its checklist as execution scope; do not redesign the architecture it tracks.
6. Research current AndroidX Compose/Figma/Material Web only for Material facts, behavior, public capability, semantic identity, and parity drift.

**Do not research upstream in order to re-decide the repository ownership model. That decision is closed unless a concrete Material requirement or web-platform constraint cannot be implemented within it.**

## Locked responsibility model

```text
immutable Material/component fact
    -> canonical DTCG
    -> Style Dictionary
    -> reviewed generated platform CSS
    -> handwritten structural/state CSS
    -> component

component semantic color
    -> canonical color.role.*
    -> var(--role)
    -> ThemeProvider concrete runtime value

runtime interaction/geometry/history
    -> React Aria/native DOM + narrow TypeScript runtime logic
```

### Non-negotiable invariants

- `packages/tokens/tokens/**/*.json` is the only authoritative immutable design-token source.
- AndroidX Compose, Figma, Material Web and other upstreams are read-only audit oracles, never token build inputs.
- Style Dictionary is the only token/platform compiler.
- `ThemeProvider` owns concrete runtime Material system colors for mode/sourceColor/contrast.
- Components consume dynamic color through semantic CSS role variables; they do not resolve Material Color Utilities themselves.
- Static visual facts must not be duplicated into handwritten `Foo.tokens.ts`, `Foo.defaults.ts`, projection maps, or large inline CSS-variable serializers when Style Dictionary/CSS can express them.
- React/TypeScript owns only genuine runtime behavior: interaction ordering/history, runtime state selection, DOM measurements, pointer/ripple geometry, lifecycle/timers, prop-dependent arithmetic, and real user-provided runtime overrides.
- React Aria/native HTML owns web semantics, focus/keyboard/press behavior whenever it already provides the correct abstraction.
- Do not add a MUI-style `theme.components` / `ThemeProvider.components` component-default registry.
- Do not port Kotlin runtime types or call graphs merely for source-shape parity.

## Closed decision: Compose `FooDefaults`

Compose APIs such as `ButtonDefaults`, `TextFieldDefaults`, `SliderDefaults`, `ButtonColors`, `TextFieldColors`, and similar types are important **semantic evidence**. They tell us about defaults, states, variants, sizes, behavior, and customization capability.

They do **not** automatically require equivalent TypeScript objects or public names.

For immutable defaults, the web-native equivalent is normally:

```text
canonical component DTCG
    -> generated component CSS
    -> component
```

not:

```text
DTCG
    -> generated JS
    -> Foo.tokens.ts
    -> Foo.defaults.ts
    -> inline CSS variables
    -> CSS
```

A `Foo.defaults.ts` or `Foo.tokens.ts` file is allowed only when it contains real runtime logic. Its filename is not permission to duplicate immutable token data.

If Compose exposes a meaningful customization capability that m3-ui lacks, preserve the **capability**, not necessarily the Kotlin API shape. Add the narrowest idiomatic React/CSS contract that preserves Material semantics without bypassing canonical DTCG or dynamic theme inheritance.

## Static-versus-runtime decision tree

For every value touched during a parity audit, classify it before coding.

### 1. Immutable design fact?

Examples:
- variant/state semantic color role;
- dimension, spacing, minimum size;
- typography role/metric;
- default shape/radius;
- state opacity;
- static duration/easing;
- static outline/shadow recipe.

**Owner:** canonical DTCG.

### 2. Can the browser express the mapping without JS-only information?

Examples:
- selectors and `data-*` states;
- CSS custom properties;
- `calc()`;
- `color-mix()`;
- static size/variant/state matrices.

**Owner:** Style Dictionary generated adapter + handwritten structural/state CSS.

### 3. Does it require live runtime information?

Examples:
- current/previous press-hover-focus precedence;
- outgoing/incoming elevation transition selection;
- DOM measurement;
- pointer coordinates/ripple radius;
- timers/lifecycle;
- arithmetic involving live props/current values/measurements;
- user-supplied runtime overrides.

**Owner:** narrow TypeScript runtime logic, consuming generated token values only when JS genuinely needs them.

### 4. Is it a concrete system color derived from sourceColor/mode/contrast?

**Owner:** `ThemeProvider`.

Components reference the semantic role through CSS; they do not ask ThemeProvider for visual defaults that CSS can inherit.

## Compose-to-web rule

Match observable Material semantics, not Compose runtime mechanics.

Examples:

| Compose concept | Preferred web mapping |
| --- | --- |
| `MaterialTheme.colorScheme` | ThemeProvider + scoped CSS role variables |
| visual `CompositionLocal` | CSS cascade/inheritance |
| JS-required CompositionLocal | typed React Context only when necessary |
| `FooDefaults` static values | canonical DTCG + generated CSS |
| `MutableInteractionSource` | React Aria/native interaction state + tiny coordinator only for required ordering/history |
| `Modifier` | props/class/CSS |
| semantics/Role | native element semantics + ARIA |
| `Dp` static metric | generated CSS length |
| runtime Dp arithmetic | generated numeric token at narrow JS arithmetic boundary |
| Kotlin data-class `copy` | ordinary TS object/factory only when a runtime value object is genuinely useful |

## Audit protocol for a component family

When asked to audit or implement a Material component:

1. Inspect the current m3-ui public API, CSS, token imports, `*.tokens.ts`, `*.defaults.ts`, internal helpers, tests, and Storybook stories.
2. Inspect current/pinned AndroidX Material3 source and API for variants, defaults, states, behavior, metrics, semantics, and experimental status.
3. Cross-check Figma/Material Web where they provide useful semantic or web-rendering evidence.
4. Classify each finding as:
   - canonical immutable token;
   - generated platform CSS;
   - handwritten structural/state CSS;
   - ThemeProvider foundation;
   - runtime TypeScript;
   - public web API capability;
   - internal-only adaptation.
5. Reuse React Aria/native primitives for web semantics instead of implementing competing keyboard/focus/overlay state machines.
6. Document intentional web differences rather than hiding them behind a mechanical Compose port.
7. Add/adjust canonical DTCG manually; never generate canonical tokens from upstream.
8. Extend Style Dictionary rather than adding another static projection layer.
9. Verify unit/default/behavior/accessibility tests and visual parity for affected variants/states/sizes.

## Issue #150 execution rule

For `Complete DTCG → generated CSS static-default migration` (#150):

- work in small component/foundation batches;
- do not mix unrelated layout work into the batch;
- record the static/runtime split in the PR/commit description;
- add newly discovered migration candidates to #150 before implementing them;
- mark a checkbox complete only after focused tests and visual parity pass;
- treat Button/TextField/Elevation/Ripple migrations as reference slices, not reasons to invent new ownership patterns;
- if a task appears to require violating the locked model, provide concrete Material/web evidence in #150 before changing architecture.

## Forbidden regressions

Do not introduce or reintroduce:

- upstream-generated canonical token snapshots;
- upstream files in Style Dictionary `source`/`include`;
- `packages/tokens/src/` handwritten token facades;
- component copies of `var(--role)` when a canonical role alias exists;
- component-side dynamic Material color resolution;
- static `FooDefaults.colors()`/`FooColors` facades whose only job is restating DTCG mappings;
- large static token-to-inline-style serializers in React;
- duplicated static `color-mix()`/state/size matrices in TypeScript when generated CSS can own them;
- generic global CSS-variable dumps without a concrete platform consumer;
- MUI-style global component default registries;
- custom overlay/focus/keyboard state machines where React Aria already owns the correct web behavior;
- architecture changes justified only by “Compose does it this way.”

## When architecture may be revisited

Only reopen a locked decision when there is a **specific observable Material requirement or web-platform constraint** that the current model cannot satisfy.

Before changing the model:

1. state the exact unsatisfied requirement;
2. cite current upstream/web-platform evidence;
3. explain why canonical DTCG + Style Dictionary + CSS cascade + ThemeProvider + narrow runtime TS cannot express it;
4. propose the smallest boundary change;
5. update `/docs/architecture/README.md`, this skill, and affected subsystem docs in the same change.

A difference in upstream implementation structure alone is not sufficient evidence.
