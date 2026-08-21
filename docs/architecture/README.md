# Compose parity architecture

This document defines how `m3-ui` ports Material 3 from Jetpack Compose to React + TypeScript.

The goal is **behavioral and visual parity**, not source-code translation. AndroidX Material 3 is the source of truth for component behavior, generated tokens, defaults, state resolution, layout rules, and tests. The TypeScript implementation must remain idiomatic for React, React Aria Components, the DOM, and CSS.

## What “1:1” means

A port is considered 1:1 when the web component matches Compose for the parts that are meaningful on the web:

- public component variants and defaults;
- Material tokens and role mapping;
- enabled, disabled, hovered, pressed, focused, selected, error, and other component states;
- layout metrics, minimum sizes, spacing, shape, elevation, and state layers;
- accessibility semantics and keyboard behavior, translated to native HTML/ARIA conventions;
- controlled/uncontrolled state behavior where a web equivalent exists;
- visual output for the same Material theme inputs;
- documented edge cases and upstream regression tests that are relevant to the DOM.

It does **not** mean translating Kotlin syntax or Compose runtime concepts literally.

Do not port these constructs directly:

- `Modifier` chains;
- `@Composable` mechanics;
- `CompositionLocal` when CSS inheritance solves the problem;
- Kotlin `data class` + `copy()` patterns;
- wrapper classes for `Dp`, `Color`, or simple shapes;
- `MutableInteractionSource` when React Aria already exposes the corresponding interaction state;
- Compose-only layout primitives when CSS has a direct semantic equivalent.

## Source of truth

Every port must record the exact AndroidX source revision used for parity work. Do not silently follow a moving branch while implementing a component.

The future sync tooling will keep a manifest under `scripts/compose-sync/` with:

- AndroidX repository URL;
- pinned commit SHA;
- Material3 module path;
- token generator/source paths;
- files used for each ported component;
- upstream test files used as parity references.

When upstream changes are intentionally adopted, update the pinned revision in a dedicated change and review the resulting token/test drift.

## Directory structure

```text
packages/ui/
├── src/
│   ├── components/
│   │   ├── Button/
│   │   ├── Checkbox/
│   │   ├── TextField/
│   │   └── README.md
│   │
│   ├── theme/
│   │   ├── colors/
│   │   ├── typography/
│   │   ├── shapes/
│   │   ├── motion/
│   │   ├── elevation/
│   │   └── README.md
│   │
│   ├── tokens/
│   │   ├── generated/
│   │   └── README.md
│   │
│   └── internal/
│       ├── surface/
│       ├── state-layer/
│       ├── interactions/
│       ├── focus-ring/
│       ├── text-field/
│       └── README.md
│
├── test/
│   ├── compose-parity/
│   └── fixtures/
│
└── ...

scripts/
└── compose-sync/
    └── README.md
```

Git does not store empty directories, so each architectural directory starts with documentation. Implementation files are added only when the corresponding layer is actually needed.

## Dependency direction

Dependencies flow in one direction:

```text
generated tokens
      ↓
theme foundations
      ↓
component defaults / internal primitives
      ↓
public components
      ↓
apps / consumers
```

Cross-platform parity fixtures and tests may inspect public/internal outputs, but production code must never import from `test/`.

Rules:

1. `tokens/generated` is data only. It must not import React, DOM APIs, component code, or React Aria.
2. `theme` owns global Material foundations such as color roles, typography, shapes, motion, and elevation.
3. `internal` owns reusable implementation primitives that are not public API.
4. `components` owns public React components and component-specific defaults/types/styles.
5. Public components may depend on `internal`, `theme`, and `tokens`; lower layers must not depend on public components.
6. Avoid circular dependencies. If two components need the same behavior, extract a narrow primitive into `internal` instead of importing one component into another.

## Compose → TypeScript mapping

Use semantic equivalents rather than syntax equivalents.

| Compose concept | TypeScript/web equivalent |
| --- | --- |
| `@Composable` | React function component |
| content lambda | `ReactNode` or typed render prop |
| `MaterialTheme.colorScheme` | CSS custom properties + theme model |
| `CompositionLocal` visual values | CSS cascade where possible |
| `CompositionLocal` behavioral values | React Context when JS access is required |
| `Color` | CSS color string or typed color role |
| `Dp` | numeric token converted to CSS length at the style boundary |
| `Shape` | typed shape token / CSS radius values |
| `TextStyle` | typography token mapped to CSS properties |
| `Modifier` | props + class names + CSS layout |
| `MutableInteractionSource` | React Aria render/data states |
| semantics / `Role` | native element semantics + ARIA |
| `Color.Unspecified` | `undefined` |
| Kotlin `copy(...)` | object spread / factory override |
| overload-heavy APIs | optional props or discriminated unions |

## Generated tokens vs handwritten code

Generated token files are the only part intended to mirror upstream Material token data mechanically.

Generated files must:

- contain data only;
- be deterministic;
- include source metadata;
- use idiomatic TypeScript objects and literal unions;
- use `as const satisfies ...` where it improves type safety;
- be regenerated instead of manually edited.

Example shape:

```ts
export const filledButtonTokens = {
  containerColor: 'primary',
  disabledContainerOpacity: 0.1,
  hoveredContainerElevation: 1,
  labelTextColor: 'onPrimary',
} as const satisfies ButtonTokenSet;
```

Do not generate Kotlin-shaped TypeScript classes, companion objects, getters, or `.copy()` APIs.

Handwritten component code must be designed for TypeScript and the DOM even when the behavior comes from Compose.

## Public component architecture

A typical component should have a small public layer and explicit internal layers.

```text
Button/
├── Button.tsx
├── Button.types.ts
├── Button.defaults.ts
├── button.css
├── index.ts
└── README.md      # optional component-specific parity notes
```

More complex components may add an `internal/` folder inside their component directory, for example TextField layout and decoration primitives.

Public component code should mostly:

1. normalize public props;
2. select a variant/default set;
3. delegate interaction semantics to React Aria/native HTML;
4. expose state to CSS;
5. compose internal layout primitives;
6. avoid embedding large token tables or duplicated state machines.

## State and interaction model

React Aria Components is the default source for web interaction state when it has the appropriate primitive.

Prefer states such as:

- `data-hovered`;
- `data-pressed`;
- `data-focused`;
- `data-focus-visible`;
- `data-disabled`;
- `data-selected`;
- `data-indeterminate`;
- `data-invalid`.

Use CSS selectors for purely visual state resolution. Do not mirror every hover/press/focus state into React state if the DOM already exposes it.

Use JavaScript state only when behavior, layout, measurement, or controlled component state actually requires it.

## CSS and theme contract

System color roles use short CSS custom properties:

```text
--primary
--on-primary
--primary-container
--surface
--surface-container-high
--outline
--error
```

Do not add `--md-sys-` or another global prefix back to system color roles.

Component-internal variables may use a component namespace when useful, for example:

```text
--button-container-color
--button-label-color
--button-container-elevation
```

These should normally resolve to system roles or generated component tokens.

`ThemeProvider` owns theme scope. Components should consume CSS variables rather than call `useTheme()` for ordinary visual styling. Context is reserved for values that must be available to JavaScript.

## Defaults layer

Compose component `Defaults` objects are an important architectural boundary and should have an equivalent concept.

TypeScript defaults should be plain objects and functions, not Kotlin-style singleton/class emulation.

Preferred style:

```ts
export const ButtonDefaults = {
  minHeight: 40,
  minWidth: 64,
  colors: {
    container: 'var(--primary)',
    content: 'var(--on-primary)',
  },
} as const satisfies ButtonDefaultsContract;
```

If defaults require theme-dependent JavaScript computation, expose a small pure factory function.

## TypeScript code style

All handwritten code must look like normal modern TypeScript.

Required conventions:

- `interface` for public object-shaped contracts and component props;
- `type` for unions, mapped types, conditional types, aliases, and composition;
- `readonly` for immutable configuration contracts;
- `as const satisfies` for typed constants where appropriate;
- explicit discriminated unions instead of invalid combinations of booleans;
- object spread for overrides;
- `undefined` for omitted/default behavior;
- pure functions for token/default transformation;
- React naming conventions and React Aria naming where public semantics match (`isDisabled`, `isSelected`, `onPress`, etc.);
- small public files and focused internal helpers.

Avoid:

- Kotlin-shaped classes;
- Java-style builders;
- enum-heavy modeling when a string literal union is clearer;
- `any` to silence parity/type problems;
- giant component functions containing token mapping, state logic, layout, and accessibility all together;
- custom abstractions that duplicate native HTML or React Aria behavior.

## Accessibility translation

Parity with Compose semantics must be translated to correct web semantics, not copied literally.

Examples:

- buttons use `<button>` semantics through React Aria Button;
- checkboxes use checkbox semantics with keyboard and indeterminate support;
- links remain links rather than clickable generic surfaces;
- labels, descriptions, errors, and form state use proper accessible relationships;
- focus-visible behavior follows browser/React Aria conventions.

If Compose behavior conflicts with a stronger native web accessibility convention, document the difference and prefer correct web semantics.

## Parity testing strategy

Every substantial component port should be covered at four levels.

### 1. Token parity

Verify generated token values against pinned upstream token data.

### 2. Defaults parity

Verify token + theme inputs resolve to expected Material defaults for each variant and state.

### 3. Behavioral parity

Verify user-facing interaction behavior:

- keyboard;
- pointer/touch interaction where testable;
- controlled state;
- disabled behavior;
- focus behavior;
- form semantics;
- accessibility roles and relationships.

### 4. Visual/layout parity

Verify measurable Material rules such as:

- minimum size;
- padding;
- icon size and spacing;
- shape;
- state-layer opacity;
- elevation;
- border thickness;
- label/supporting text placement;
- transition timing where stable to test.

Expected baseline values must come from pinned upstream data or explicit fixtures, not from the implementation being tested.

## Port workflow for one component

Before writing implementation code for a new component:

1. Pin/confirm the AndroidX revision.
2. Identify the public Compose component file.
3. Identify its generated token file(s).
4. Identify the `Defaults` object and related state classes.
5. Identify internal primitives it delegates to.
6. Identify relevant AndroidX tests.
7. Record the state/variant matrix.
8. Add or update generated token fixtures.
9. Design the TypeScript public API using React conventions.
10. Write parity tests before or alongside implementation.
11. Implement using React Aria/native semantics and CSS.
12. Compare behavior/layout against the upstream contract.
13. Document intentional web-only differences.

Do not begin by translating the Kotlin file line by line.

## Recommended port order

Build foundations before complex components:

1. theme foundations and generated token pipeline;
2. internal surface/state-layer/elevation primitives;
3. Button family;
4. Checkbox and tri-state checkbox;
5. RadioButton;
6. Switch;
7. TextField and OutlinedTextField;
8. Card;
9. Chips;
10. FAB and IconButton;
11. navigation components;
12. dialogs and sheets;
13. complex pickers and higher-level components.

## Review checklist

A port is not ready to merge until reviewers can answer “yes” to the following:

- Is the AndroidX source revision recorded?
- Are token mappings traceable to upstream generated data?
- Is the TypeScript API idiomatic rather than Kotlin-shaped?
- Are native HTML and React Aria semantics used where available?
- Are visual states resolved in CSS when possible?
- Are generated and handwritten files clearly separated?
- Is dependency direction respected?
- Are parity fixtures independent from implementation output?
- Are intentional web differences documented?
- Do tests, typecheck, and build pass in CI?
