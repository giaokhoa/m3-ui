---
name: material3-parity
description: Use for any Material 3 component parity work in @m3-ui/ui, including component implementation/refactors, defaults, tokens, ThemeProvider, generated CSS, React Aria behavior, accessibility, elevation/ripple, public API audits, or issue #150 migration work. Read this before deciding where Material defaults or runtime behavior belong.
---

# Material 3 parity

This skill is the repository policy contract for Material 3 component/theme/token work.

Human-facing repository structure and execution are documented in root `README.md`, `packages/tokens/README.md`, `packages/ui/src/theme/README.md`, and subsystem READMEs. This skill owns the decisions agents must follow when translating Material/Compose semantics to the web.

## Start protocol

Before changing a Material component, component token/default layer, ThemeProvider, generated component CSS, elevation/ripple, or parity-facing public API:

1. Read the relevant package/subsystem README to understand the current structure and execution path.
2. If tokens, Style Dictionary, generated CSS, or token ownership are involved, also read `.agents/skills/style-dictionary/SKILL.md` and `packages/tokens/README.md`.
3. If theme/color runtime is involved, read `packages/ui/src/theme/README.md`.
4. If working from issue #150, treat its checklist as execution scope.
5. Research current/pinned AndroidX Compose, Figma and Material Web for Material facts, behavior, public capability, semantic identity and drift.

Do **not** start by researching where defaults/theme/runtime values should live. That ownership model is already decided unless a concrete observable Material requirement or web-platform constraint cannot be represented by it.

## Why this architecture exists

Material separates component semantics from the active theme. Compose expresses much of that relationship through runtime objects such as `MaterialTheme`, generated component token objects and `FooDefaults`. The browser additionally has CSS inheritance, custom properties and state selectors.

m3-ui preserves the Material responsibility split while using web-native execution points:

```text
immutable Material fact
    -> canonical DTCG
    -> Style Dictionary
    -> generated web adapter
    -> browser CSS
```

Dynamic color is resolved separately:

```text
component semantic color token
    -> canonical color role
    -> var(--role)
    -> ThemeProvider concrete runtime value
```

This gives the repository one immutable semantic source, one token/platform compiler, cheap nested themes, runtime `sourceColor` propagation through CSS, and React code focused on behavior that actually requires live state.

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
- `ThemeProvider` owns concrete runtime Material system colors derived from mode/sourceColor/contrast.
- Components consume dynamic color through semantic CSS role variables; they do not run Material Color Utilities themselves.
- Static visual facts are not duplicated into handwritten `Foo.tokens.ts`, `Foo.defaults.ts`, projection maps, or large inline CSS-variable serializers when Style Dictionary/CSS can express them.
- React/TypeScript owns genuine runtime behavior: interaction ordering/history, runtime state selection, DOM measurements, pointer/ripple geometry, lifecycle/timers, prop/current-value arithmetic, and real user-provided runtime overrides.
- React Aria/native HTML owns web semantics, focus, keyboard, press and overlay behavior whenever it already provides the correct abstraction.
- Do not add a MUI-style `theme.components` / `ThemeProvider.components` component-default registry.
- Do not port Kotlin runtime types or call graphs merely for source-shape parity.

## Closed decision: Compose `FooDefaults`

Compose APIs such as `ButtonDefaults`, `TextFieldDefaults`, `SliderDefaults`, `ButtonColors`, `TextFieldColors` and similar types are semantic evidence. They tell us which defaults, states, variants, sizes, behaviors and customization capabilities exist.

They do **not** automatically require equivalent TypeScript objects or public names.

For immutable defaults, the web-native equivalent is normally:

```text
canonical component DTCG
    -> Style Dictionary
    -> generated component CSS
    -> component
```

not:

```text
DTCG
    -> generated JS constants
    -> Foo.tokens.ts
    -> Foo.defaults.ts
    -> inline CSS variables
    -> CSS
```

A `Foo.defaults.ts` or `Foo.tokens.ts` file is valid only when it contains real runtime logic. Its filename is not permission to duplicate immutable token data.

If Compose exposes a meaningful customization capability that m3-ui lacks, preserve the **capability**, not necessarily the Kotlin API shape. Add the narrowest idiomatic React/CSS contract that preserves Material semantics without bypassing canonical DTCG or dynamic theme inheritance.

## Static-versus-runtime decision tree

Classify every value before coding.

### 1. Is it an immutable Material/design fact?

Examples:

- variant/state semantic color role;
- dimension, spacing or minimum size;
- typography role/metric;
- default shape/radius;
- state opacity;
- static duration/easing;
- static outline/shadow recipe.

**Owner:** canonical DTCG.

### 2. Can the browser express the platform mapping without JS-only information?

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

**Owner:** narrow TypeScript runtime logic. Generated token values may be consumed at that arithmetic/behavior boundary when JS genuinely needs them.

### 4. Is it a concrete Material system color derived from `sourceColor`, mode or contrast?

**Owner:** `ThemeProvider`.

Components reference semantic roles through CSS rather than asking ThemeProvider for visual defaults that CSS can inherit.

## Compose-to-web mapping

Match observable Material semantics, not Compose runtime mechanics.

| Compose concept | Preferred web mapping |
| --- | --- |
| `MaterialTheme.colorScheme` | ThemeProvider + scoped CSS role variables |
| visual `CompositionLocal` | CSS cascade/inheritance |
| JS-required `CompositionLocal` | typed React Context only when necessary |
| `FooDefaults` static values | canonical DTCG + generated CSS |
| `MutableInteractionSource` | React Aria/native interaction state + tiny coordinator only for required ordering/history |
| `Modifier` | props/class/CSS |
| semantics / `Role` | native element semantics + ARIA |
| static `Dp` metric | generated CSS length |
| runtime `Dp` arithmetic | generated numeric token at a narrow JS arithmetic boundary |
| Kotlin data-class `copy` | ordinary TS object/factory only when a runtime value object is genuinely useful |

## Component audit protocol

When asked to audit or implement a Material component family:

1. Inspect current m3-ui public API, CSS, token imports, `*.tokens.ts`, `*.defaults.ts`, helpers, tests and Storybook stories.
2. Inspect current/pinned AndroidX Material3 source/API for variants, defaults, states, behavior, metrics, semantics and experimental status.
3. Cross-check Figma/Material Web where they provide useful semantic or browser-rendering evidence.
4. Classify each finding as one of:
   - canonical immutable DTCG;
   - generated platform CSS;
   - handwritten structural/state CSS;
   - ThemeProvider foundation;
   - runtime TypeScript;
   - public web API capability;
   - internal-only adaptation.
5. Reuse React Aria/native primitives instead of implementing competing focus/keyboard/overlay state machines.
6. Add/update canonical DTCG manually; upstream evidence must never generate canonical tokens.
7. Extend Style Dictionary for static platform projection instead of adding a parallel runtime projector.
8. Document intentional web differences when Compose runtime mechanics do not map literally.
9. Verify focused unit/default/behavior/accessibility tests and visual parity for affected variants/states/sizes.

## Issue #150 execution rule

For `Complete DTCG → generated CSS static-default migration` (#150):

- work in small component/foundation batches;
- do not mix unrelated `packages/ui/src/layout/**` changes into a component/theme/token batch;
- record the static/runtime split in the PR/commit description;
- add newly discovered migration candidates to #150 before implementing them;
- mark a checkbox complete only after focused tests and visual parity pass;
- treat Button/TextField/Elevation/Ripple as reference slices, not reasons to invent new ownership patterns;
- preserve legitimate runtime calculations such as Surface tonal elevation rather than moving code to CSS solely to reduce TypeScript.

## Forbidden regressions

Do not introduce or reintroduce:

- upstream-generated canonical token snapshots;
- upstream files in Style Dictionary `source`/`include`;
- `packages/tokens/src/` handwritten token facades;
- component copies of `var(--role)` when a canonical role alias exists;
- component-side dynamic Material color resolution;
- static `FooDefaults.colors()` / `FooColors` facades whose only job is restating DTCG mappings;
- large static token-to-inline-style serializers in React;
- duplicated static `color-mix()` / state / size matrices in TypeScript when generated CSS can own them;
- generic global non-color CSS-variable dumps without a concrete platform consumer;
- MUI-style global component default registries;
- custom overlay/focus/keyboard state machines where React Aria already owns the correct web behavior;
- architecture changes justified only by “Compose does it this way.”

## When the model may be revisited

Only reopen a locked decision when there is a **specific observable Material requirement or web-platform constraint** that the current model cannot satisfy.

Before changing it:

1. state the exact unsatisfied requirement;
2. cite current upstream/web-platform evidence;
3. explain why canonical DTCG + Style Dictionary + CSS cascade + ThemeProvider + narrow runtime TS cannot express it;
4. propose the smallest boundary change;
5. update this skill, the relevant package/subsystem README and affected specialized skills in the same change.

A difference in upstream implementation structure alone is not sufficient evidence.
