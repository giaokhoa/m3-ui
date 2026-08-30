# Elevation implementation notes

Read this file before changing `packages/ui/src/internal/elevation`, elevation token serialization, or component elevation integration.

This subsystem maps Material 3 semantic elevation levels to web shadow paint while separating **runtime level selection** from **immutable shadow serialization**.

## Material/token ownership

- canonical DTCG owns semantic elevation levels and the reviewed shadow recipes;
- Style Dictionary serializes immutable shadow geometry/opacities into generated `elevation.css`;
- `ThemeProvider` owns the concrete runtime `--shadow` color;
- component runtime code owns interaction precedence/history and chooses the semantic `ElevationLevel`;
- component code should not rebuild canonical `box-shadow` strings from token constants.

The default child-paint integration is intentionally narrow:

```tsx
<Elevation level={level} />
```

A component using `<Elevation>` should normally only select the semantic `level`. Genuine runtime values such as a public `shadowColor` override or runtime-selected transition style may also be passed when the component behavior requires them.

Do not create component-specific Elevation alias classes such as `button__elevation`, `dialog__elevation`, or similar merely to name the paint node. Generic paint-layer structure belongs to the shared primitive; component-specific behavior can target the actual structural relationship when needed. Existing callers that violate this rule are migration debt to handle when those components are audited, not a reason to type-lock the primitive API.

## Shared paint implementation

The current `<Elevation>` paint node uses the shared `.elevation` class and `data-elevation="levelN"`. Handwritten elevation CSS owns generic paint-layer behavior such as absolute fill, inherited radius, and pointer-event transparency; generated CSS supplies the selected shadow recipe.

Some components currently paint the same generated recipe on an existing root through `.elevation-host[data-elevation]` because their clipped/scrolling/transformed/measured DOM makes a descendant paint node inconvenient. This host mode is a web implementation escape hatch, not a Material component contract and not a repository-wide requirement.

`.elevation-host` is currently paint-only. Components may be refactored to another paint boundary when that produces the same Material rendering and preserves their geometry, clipping, scrolling, transforms, measurements, interactions, and accessibility. Do not add executable guards that freeze host mode, wrapper names, or a particular DOM hierarchy.

## Level 0

Material level 0 has no visible shadow. The current generated web adapter serializes that state as `box-shadow: none`; higher levels use the reviewed generated shadow recipe.

Treat `none` as the current platform representation of semantic absence, not as a reason to push shadow serialization back into React. If the platform serializer changes while preserving Material semantics, review the generated-output and browser tests together rather than locking an incidental textual form in component code.

## Shadow color overrides

A real runtime `shadowColor` override may set the private shadow-color variable used by the generated recipe. It must not cause React to regenerate the shadow list.

The default remains `var(--shadow)`, whose concrete value is supplied by `ThemeProvider`.

## Motion

Elevation transition **selection** remains runtime when the correct incoming/outgoing transition depends on interaction state or history. Immutable motion token values remain canonical tokens.

Runtime transition selection is not justification for serializing static shadow geometry in JavaScript. Conversely, generated CSS should not absorb interaction-history logic merely to eliminate runtime state.

## Current provenance and known drift

Semantic levels `0 / 1 / 3 / 6 / 8 / 12` are reconciled against the pinned AndroidX and Material Web evidence.

The canonical web shadow recipe currently has three layers with opacities `0.20 / 0.14 / 0.12`. Pinned Figma Material 3 and Material Web renderer evidence uses two key/ambient layers at `0.30 / 0.15`. This remains explicit cross-source drift in `packages/tokens/audit/elevation-reference-evidence.json` and `foundation-drift.json`.

Do not silently replace the canonical recipe during an implementation cleanup. A canonical recipe change requires a separate Material/spec provenance review and corresponding audit/drift update.

## Generated CSS location

Generated platform CSS stays centralized under:

```text
packages/tokens/dist/generated/elevation.css
```

Public modular UI styles that consume Elevation must include the generated adapter and the shared handwritten paint CSS required for their rendered output. Tests may verify that the resulting public CSS is self-contained without maintaining a component-name allowlist.

## Validation

Prefer tests that validate Material/token semantics and observable rendering:

1. canonical elevation reference evidence and generated CSS output;
2. component runtime selection of the correct semantic `ElevationLevel`;
3. computed browser shadow on the paint boundary actually used by the component;
4. runtime shadow-color and motion behavior where applicable;
5. component geometry, clipping, interactions, and accessibility after paint-boundary changes;
6. normal unit/type/build and visual regression coverage.

Do not add source-regex tests for exact Elevation class names, wrapper names, `.elevation-host` usage, paint-node placement, or README wording. Those are implementation details unless a Material requirement makes the observable result itself normative.
