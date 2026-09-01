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

React Aria/native host
    -> normalized current interaction state / PressEvent
    -> shared Material effects
    -> narrow runtime geometry/lifecycle only where required
```

### Non-negotiable invariants

- `packages/tokens/tokens/**/*.json` is the only authoritative immutable design-token source.
- AndroidX Compose, Figma, Material Web and other upstreams are read-only audit oracles, never token build inputs.
- Style Dictionary is the only token/platform compiler.
- `ThemeProvider` owns concrete runtime Material system colors derived from mode/sourceColor/contrast.
- Components consume dynamic color through semantic CSS role variables; they do not run Material Color Utilities themselves.
- Static visual facts are not duplicated into handwritten `Foo.tokens.ts`, `Foo.defaults.ts`, projection maps, or large inline CSS-variable serializers when Style Dictionary/CSS can express them.
- React Aria/native HTML is the interaction-semantics source of truth whenever it already provides the correct focus, hover, press, disabled, keyboard and accessibility abstraction.
- Components must not reconstruct RAC hover/focus/press state with their own `activeInteractions` arrays, mirrored booleans or event state machines merely to drive shared Material effects.
- React/TypeScript owns only genuine runtime work such as DOM measurement, pointer/ripple geometry, wave/timer lifecycle, runtime prop/current-value arithmetic, real user overrides, and narrowly scoped previous-state tracking inside an effect when an observable motion requirement needs it.
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

## Closed decision: React Aria interaction effects

This section is the authoritative contract for shared Elevation and Ripple integration. If existing component code or subsystem README text conflicts with it, treat that code/text as migration debt until the interaction-effects remediation work updates it.

### React Aria is the interaction source of truth

For RAC-backed controls, consume the normalized current render state and PressEvents that RAC already provides. Do not recreate the same hover/focus/press semantics in component-local state.

The default web precedence for simultaneous Material interaction states is:

```text
disabled > pressed > hovered > focused > default
```

This precedence is a closed web adaptation aligned with RAC's simultaneous normalized states and Material Web's deterministic state ordering. Do **not** port Compose `MutableInteractionSource` / "last interaction wins" history merely to mirror Compose runtime structure. Reintroduce interaction history only if an observable parity test proves current RAC state cannot express a required Material behavior.

Do not use RAC `slot`, `ButtonContext`, or another component-specific context as a generic interaction-state bus for Elevation/Ripple. Do not wrap the semantic RAC host in an effect component merely so the effect can discover state. The semantic control remains the real interaction host; paint layers render on the appropriate surface without becoming a competing semantic host.

### Elevation contract

Shared Elevation owns runtime semantic level resolution and immutable shadow paint. Components provide semantic level values for their Material variant but do not resolve the current hover/focus/press/disabled state themselves.

Preferred integration shape:

```text
RAC render state + component semantic elevation levels
    -> shared Elevation
    -> resolved ElevationLevel
    -> generated elevation.css shadow recipe
```

Rules:

- `<Elevation level="levelN" />` remains valid for static surfaces or callers that already have a genuine runtime semantic level for reasons unrelated to common RAC interaction resolution.
- RAC-backed interactive components should pass normalized current state plus their semantic level set to shared Elevation rather than maintaining `resolveFooElevation()` / `getFooElevationLevel()` helpers whose only job is common hover/focus/press/disabled selection.
- The semantic level set may consume generated token values because shared Elevation genuinely needs those runtime semantic inputs; it must not reconstruct shadow geometry in TypeScript.
- Shared Elevation applies the locked precedence `disabled > pressed > hovered > focused > default`.
- If incoming/outgoing elevation motion observably requires the previously resolved interaction, that previous-state bookkeeping belongs inside the shared Elevation effect/integration, not in every component.
- Generated `elevation.css` owns immutable shadow geometry/opacities and semantic level paint only.
- Do **not** generate component selectors such as `.button[data-hovered] > .elevation` merely to choose Elevation levels, and do not make the token compiler depend on Elevation's internal DOM placement/class names.
- Do not create component-specific Elevation wrapper/alias classes merely to name the paint node.

Material Web may use CSS selectors to choose elevation on its custom-element surface, while Compose uses `InteractionSource`. Those are upstream implementation strategies, not repository ownership mandates. m3-ui keeps current-state semantic resolution in the shared runtime effect and shadow serialization in generated CSS.

### Ripple contract

RAC/native host semantics own press/hover/focus. Shared Ripple must consume those semantics rather than creating a second press engine.

Preferred integration shape:

```text
RAC current render state
    -> <Ripple />
    -> hover/focus state-layer paint

RAC normalized PressEvent
    -> useRipple()
    -> measured wave geometry + active-wave lifecycle/timers
    -> <Ripple /> wave paint
```

Rules:

- Do **not** call `usePress()` again inside Ripple when the RAC host already owns press semantics.
- Do **not** attach competing native pointer/keyboard listeners inside Ripple for RAC-backed controls.
- `useRipple()` consumes normalized RAC PressEvents and owns only runtime geometry, measurement, active wave identity, minimum-press lifetime, release scheduling and cleanup.
- The shared Ripple integration should expose handlers/props that can be merged/chained with caller RAC handlers without overwriting user callbacks; do not require every component to manually call Ripple and user handlers in duplicated event plumbing.
- `<Ripple>` consumes current RAC render state for hover/focus-visible indication. Components must not maintain `latestFooStateLayerInteraction()`, local active-interaction arrays, or mirrored hover/focus state solely to feed Ripple.
- Pressed wave geometry uses RAC event coordinates/pointer type/target rather than rebuilding normalized press semantics from raw DOM events.
- Generated `ripple.css` owns immutable state-layer opacity, motion/easing and focus-ring styling; handwritten Ripple CSS owns structure/animation; React sets only genuine runtime wave/focus geometry/state.
- Component-specific focus-ring radius/inset or other indication geometry may remain runtime when it depends on the component's real visual bounds.
- Native/non-RAC hosts may adapt native events at their host boundary when necessary, but shared Ripple itself still must not become a second generic interaction state machine.

### Interaction-effect anti-patterns

Do not introduce or preserve these merely because existing code already uses them:

```text
component activeInteractions[]
    -> latestFooInteraction()
    -> resolveFooElevation()
    -> <Elevation />

component activeInteractions[]
    -> latestFooStateLayerInteraction()
    -> <Ripple />
```

The component should expose its semantic host/variant/geometry; shared effects should own common effect-state resolution.

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

- selectors and `data-*` states for ordinary component styling;
- CSS custom properties;
- `calc()`;
- `color-mix()`;
- static size/variant/state matrices.

**Owner:** Style Dictionary generated adapter + handwritten structural/state CSS.

Exception: Elevation interaction-state -> semantic-level selection follows the closed Elevation contract above. Do not move that mapping into component selectors merely because CSS could technically express it.

### 3. Does it require live runtime information?

Examples:

- normalized RAC current interaction state consumed by a shared effect;
- previous resolved Elevation state when observable incoming/outgoing motion needs it;
- DOM measurement;
- pointer coordinates/ripple radius;
- timers/lifecycle;
- arithmetic involving live props/current values/measurements;
- user-supplied runtime overrides.

**Owner:** the narrowest shared/runtime TypeScript boundary. Generated token values may be consumed there when JS genuinely needs the semantic value for runtime behavior.

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
| `MutableInteractionSource` | RAC/native normalized current state; no component-local history unless an observable parity test proves it necessary |
| ripple `InteractionSource` consumer | RAC PressEvent/current render state -> shared Ripple runtime |
| component elevation interaction resolver | RAC current render state + semantic level set -> shared Elevation runtime |
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
   - shared interaction effect;
   - runtime TypeScript;
   - public web API capability;
   - internal-only adaptation.
5. Reuse React Aria/native primitives instead of implementing competing focus/keyboard/press/overlay state machines.
6. For Elevation/Ripple consumers, audit whether component-local interaction state exists only to feed effects; migrate that responsibility to the shared effect contract instead of preserving it as component runtime logic.
7. Add/update canonical DTCG manually; upstream evidence must never generate canonical tokens.
8. Extend Style Dictionary for static platform projection instead of adding a parallel runtime projector.
9. Document intentional web differences when Compose runtime mechanics do not map literally.
10. Verify focused unit/default/behavior/accessibility tests and visual parity for affected variants/states/sizes.

## Issue #150 execution rule

For `Complete DTCG → generated CSS static-default migration` (#150):

- work in small component/foundation batches;
- do not mix unrelated `packages/ui/src/layout/**` changes into a component/theme/token batch;
- record the static/runtime split in the PR/commit description;
- add newly discovered migration candidates to #150 before implementing them;
- mark a checkbox complete only after focused tests and visual parity pass;
- do not treat historical Button/Elevation/Ripple implementation as stronger evidence than the closed interaction-effect contract in this skill;
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
- custom overlay/focus/keyboard/press state machines where React Aria already owns the correct web behavior;
- component-local interaction arrays or mirrored booleans whose only purpose is feeding Elevation/Ripple;
- `resolveFooElevation()` / `getFooElevationLevel()` helpers that only perform the common RAC interaction -> level selection now owned by shared Elevation;
- `latestFooStateLayerInteraction()` helpers that only route current RAC state into Ripple;
- generated component CSS selectors that depend on Elevation's internal DOM/classes to choose semantic levels;
- a second `usePress()` or generic native pointer/keyboard listener engine inside Ripple for RAC-backed controls;
- RAC slot/component contexts used as a generic interaction-state transport for shared effects;
- architecture changes justified only by “Compose does it this way.”

## When the model may be revisited

Only reopen a locked decision when there is a **specific observable Material requirement or web-platform constraint** that the current model cannot satisfy.

Before changing it:

1. state the exact unsatisfied requirement;
2. cite current upstream/web-platform evidence;
3. explain why canonical DTCG + Style Dictionary + CSS cascade + ThemeProvider + RAC current state + shared effects + narrow runtime TS cannot express it;
4. propose the smallest boundary change;
5. update this skill, the relevant package/subsystem README and affected specialized skills in the same change.

A difference in upstream implementation structure alone is not sufficient evidence.
