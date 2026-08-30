# Elevation architecture contract

Read this file before changing `packages/ui/src/internal/elevation`, elevation token serialization, or component elevation injection.

This subsystem translates Material 3 semantic elevation levels into web shadow painting. It deliberately separates **runtime state selection** from **immutable shadow rendering**.

## Ownership

```text
component interaction state
        |
        | runtime: choose level0...level5
        v
<Elevation /> child paint OR .elevation-host root paint
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
- `<Elevation>` is the default narrow child painting primitive. It must not rebuild canonical shadow geometry in TypeScript;
- `.elevation-host` is a paint-only host mode for a component whose existing root must remain the shadow painter because a descendant paint layer would be clipped or an added wrapper would alter scroll, transform, measurement, or positioning behavior.

## Required rendering boundary

A component that has interaction-driven elevation should pass a semantic `ElevationLevel` to `<Elevation>` when a separate child paint layer is compatible with its DOM and clipping bounds. Runtime transition style may remain on that paint layer when transition choice depends on interaction history.

Good child-paint mode:

```tsx
<Elevation
  level={level}
  style={{ transition: elevationTransition }}
/>
```

When a component already has a clipping or scrolling root that must also own transform or measurement geometry, use the documented host-paint mode instead of adding a wrapper solely for elevation:

```tsx
<div
  className="component elevation-host"
  data-elevation={level}
  style={{ '--_elevation-shadow-color': shadowColor }}
/>
```

Host mode is deliberately narrow. `.elevation-host` must not add positioning, sizing, overflow, transform, border-radius, or other layout behavior. It only paints `box-shadow: var(--_elevation-box-shadow)` from the same generated recipe used by `<Elevation>`.

Bad:

```ts
style={{ boxShadow: buildShadowFromTokenLayers(level) }}
```

Static shadow geometry, opacities, and ThemeProvider shadow-role wiring belong in the generated adapter, not inline React style. Host mode changes **where** the generated recipe is painted, not who owns the recipe.

### Level0 is semantic absence of shadow

`level0` must serialize to `--_elevation-box-shadow: none`. Do not serialize the canonical zero geometry as three colored `0px 0px 0px 0px` shadow layers: while that can look identical, the browser still computes a non-`none` shadow list and no longer represents the semantic absence of elevation.

The generated adapter may therefore special-case `level0` at the platform-serialization boundary. This does not mutate the canonical DTCG recipe. Levels `level1` through `level5` continue to serialize the canonical three-layer shadow geometry and opacities. The same semantic rule applies to both `.elevation` and `.elevation-host` selectors.

## Shadow color overrides

The primitive may accept a real runtime `shadowColor` override. Such an override should set the private shadow-color CSS variable only; it must not cause React to regenerate the shadow list.

A host-paint consumer follows the same rule: a runtime override may set `--_elevation-shadow-color` on the host, while the generated adapter remains responsible for the shadow list.

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

If the component root has `overflow: hidden` / `overflow: auto`, owns the transform used for motion, or is itself the measured scroll/surface box, a child elevation layer may be clipped and an extra wrapper may change behavior. In that case, prefer `.elevation-host[data-elevation]` and preserve the existing DOM/layout geometry. Document the reason locally in the component contract.

The target end state is no TypeScript shadow serialization for ordinary Material component elevation.

## Generated CSS location

Generated platform CSS stays centralized with other Style Dictionary artifacts:

```text
packages/tokens/dist/generated/elevation.css
```

The UI primitive imports it through the reviewed token-package CSS subpath. Modular `@m3-ui/ui/styles/*.css` builds that include handwritten `internal/elevation/elevation.css` must inline the generated adapter before that handwritten CSS so the public style artifact stays self-contained. The same dependency ordering is required for component styles that consume `.elevation-host`.

## Browser test boundary

Browser/visual contract tests must assert the actual paint layer when checking `box-shadow`: normally the descendant `.elevation` in child-paint mode, or the root carrying `.elevation-host` in documented host-paint mode. They must not require the interactive/root element itself to own `box-shadow` merely because an older implementation painted there; root painting is valid only when the component deliberately uses host mode for clipping/geometry reasons.

Root-level tests may still verify container background, border, geometry, semantics, interaction attributes, and documented host elevation state. Elevation tests should verify the semantic level/state on the actual paint element and its computed shadow.

## Forbidden regressions

Do not:

- copy elevation shadow geometry or opacity constants into React/TypeScript;
- rebuild `box-shadow` strings from generated token constants in new component code;
- hardcode a shadow color instead of resolving through `--shadow` by default;
- make generated elevation CSS define the concrete `--shadow` theme role;
- serialize `level0` as zero-geometry colored shadow layers instead of `box-shadow: none`;
- switch the canonical 3-layer recipe to Material Web's 2-layer renderer recipe without resolving the tracked provenance drift;
- use `.elevation-host` as a general styling/layout class or add geometry rules to it;
- restore handwritten root shadow serialization merely to satisfy a browser test; root painting is allowed only through `.elevation-host` plus the generated recipe;
- add a wrapper solely for elevation when it would alter an existing component's scroll, transform, measurement, or positioning contract;
- hand-edit `packages/tokens/dist/**`;
- create a second elevation event state machine inside the painting primitive.

## Required validation

Changes to this subsystem should cover:

1. canonical elevation reference-evidence tests;
2. generated `elevation.css` tests for both child and host selectors;
3. architecture guards that reject static shadow serialization returning to `<Elevation>`/migrated components;
4. UI unit/type/build tests;
5. modular style self-containment tests;
6. visual regression for affected elevated components, asserting shadow on the actual paint layer used by that component.
