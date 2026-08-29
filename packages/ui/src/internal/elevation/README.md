# Elevation architecture contract

Read this file before changing `packages/ui/src/internal/elevation`, elevation token serialization, or component elevation injection.

This subsystem translates Material 3 semantic elevation levels into web shadow painting. It deliberately separates **runtime state selection** from **immutable shadow rendering**.

## Ownership

```text
component interaction state
        |
        | runtime: choose level0...level5
        v
    <Elevation />
        |
        | data-elevation="levelN"
        v
Style Dictionary generated elevation.css
        |
        | canonical shadow geometry + opacity
        v
handwritten elevation.css
        |
        v
browser box-shadow

ThemeProvider -> --shadow -> generated elevation adapter
```

- canonical DTCG owns semantic elevation levels and shadow recipes;
- Style Dictionary owns CSS serialization of the immutable shadow recipe;
- `ThemeProvider` owns the concrete runtime `--shadow` color;
- React/component code owns interaction precedence/history and chooses the semantic elevation level;
- `<Elevation>` is a narrow painting primitive. It must not rebuild canonical shadow geometry in TypeScript.

## Required rendering boundary

A component that has interaction-driven elevation should pass a semantic `ElevationLevel` to `<Elevation>` and may provide runtime transition style when transition choice depends on interaction history.

Good:

```tsx
<Elevation
  level={level}
  style={{ transition: elevationTransition }}
/>
```

Bad:

```ts
style={{ boxShadow: buildShadowFromTokenLayers(level) }}
```

Static shadow geometry, opacities, and ThemeProvider shadow-role wiring belong in the generated adapter, not inline React style.

## Shadow color overrides

The primitive may accept a real runtime `shadowColor` override. Such an override should set the private shadow-color CSS variable only; it must not cause React to regenerate the shadow list.

The default remains `var(--shadow)`, whose concrete value is supplied by `ThemeProvider`.

## Motion

Elevation transition **selection** may remain runtime when the correct incoming/outgoing spec depends on current and previous interaction. The motion token values themselves remain canonical immutable tokens.

Do not move interaction-history logic into the generated CSS merely to remove JavaScript. Conversely, do not use runtime transition selection as justification for serializing static shadow geometry in JavaScript.

## Current provenance and known drift

Semantic levels `0 / 1 / 3 / 6 / 8 / 12` are reconciled against the pinned AndroidX and Material Web evidence.

The canonical web shadow recipe currently has three layers with opacities `0.20 / 0.14 / 0.12`. Pinned Figma Material 3 and Material Web renderer evidence uses two key/ambient layers at `0.30 / 0.15`. This is an explicit tracked cross-source drift in `packages/tokens/audit/elevation-reference-evidence.json` and `foundation-drift.json`.

Do **not** silently replace the canonical three-layer recipe with the Material Web two-layer renderer recipe. Any canonical change requires a separate normative Material specification review and corresponding audit/drift update.

## Incremental migration

Legacy components may still call the old TypeScript shadow serializer while they await component-level migration. New code must not add new callers. When a component is touched for elevation architecture work, migrate it to `<Elevation>` where its DOM/paint bounds make that primitive appropriate.

The target end state is no TypeScript shadow serialization for ordinary Material component elevation.

## Generated CSS location

Generated platform CSS stays centralized with other Style Dictionary artifacts:

```text
packages/tokens/dist/generated/elevation.css
```

The UI primitive imports it through the reviewed token-package CSS subpath. Modular `@m3-ui/ui/styles/*.css` builds that include handwritten `internal/elevation/elevation.css` must inline the generated adapter before that handwritten CSS so the public style artifact stays self-contained.

## Forbidden regressions

Do not:

- copy elevation shadow geometry or opacity constants into React/TypeScript;
- rebuild `box-shadow` strings from generated token constants in new component code;
- hardcode a shadow color instead of resolving through `--shadow` by default;
- make generated elevation CSS define the concrete `--shadow` theme role;
- switch the canonical 3-layer recipe to Material Web's 2-layer renderer recipe without resolving the tracked provenance drift;
- hand-edit `packages/tokens/dist/**`;
- create a second elevation event state machine inside the painting primitive.

## Required validation

Changes to this subsystem should cover:

1. canonical elevation reference-evidence tests;
2. generated `elevation.css` tests;
3. architecture guards that reject static shadow serialization returning to `<Elevation>`/migrated components;
4. UI unit/type/build tests;
5. modular style self-containment tests;
6. visual regression for affected elevated components.
