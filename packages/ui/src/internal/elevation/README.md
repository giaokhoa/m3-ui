# Elevation implementation

Repository policy for Material interaction ownership lives in `.agents/skills/material3-parity/SKILL.md`. Read that skill before changing this subsystem. This README describes the current implementation and execution path only.

## Structure

- `Elevation.tsx` — shared paint component and normalized current-state integration.
- `interaction.ts` — shared RAC-state precedence, semantic level resolution, and elevation transition selection.
- `tokens.ts` — typed runtime views needed for semantic levels/motion and legacy shadow inspection utilities.
- `elevation.css` — handwritten paint-layer structure.
- `@m3-ui/tokens/elevation.css` — Style Dictionary generated immutable shadow recipes.

## Data flow

Direct/static surfaces use a semantic level directly:

```text
ElevationLevel
    -> <Elevation level="levelN" />
    -> generated elevation.css
    -> shadow paint
```

RAC-backed interactive controls use normalized current state plus their Material semantic level set:

```text
RAC render state + semantic level set
    -> shared Elevation interaction resolver
    -> ElevationLevel
    -> generated elevation.css
    -> shadow paint
```

The shared resolver uses the repository interaction precedence defined in the Material parity skill. Component code supplies semantic values for its variant but does not need a local hover/focus/press history merely to select the common elevation state.

## Motion

For interactive `levels + state` usage, `<Elevation>` keeps the previous resolved interaction locally so it can select the existing incoming/outgoing elevation motion tokens. Direct `level` callers do not receive an automatic interaction transition.

`prefers-reduced-motion` handling may still be applied by the owning component stylesheet when the effect participates in that component's motion surface.

## Paint

The paint node is `.elevation[data-elevation="levelN"]`. Handwritten CSS owns absolute fill/inherited radius/pointer-event behavior; generated CSS owns shadow geometry and opacity. `ThemeProvider` supplies the concrete `--shadow` role.

Some existing consumers also use `.elevation-host[data-elevation]` on an existing surface where a child paint node is inconvenient. That is an implementation escape hatch and should be judged by rendered geometry/clipping behavior rather than treated as a component API.

A runtime `shadowColor` may override the private shadow-color variable without rebuilding the shadow recipe in React.

## Provenance

Semantic levels `0 / 1 / 3 / 6 / 8 / 12` are reconciled against the pinned AndroidX and Material Web evidence.

The canonical web recipe currently retains the repository's reviewed three-layer shadow representation. Pinned Figma/Material Web renderer evidence uses a two-layer representation; that known drift remains tracked in the token audit evidence and is not changed by interaction refactors.

## Generated CSS

The generated platform adapter is emitted at:

```text
packages/tokens/dist/generated/elevation.css
```

Public modular UI styles that render Elevation must include the generated adapter before handwritten paint CSS.

## Validation

Relevant checks cover:

1. semantic elevation levels and shared state precedence;
2. incoming/outgoing motion selection;
3. generated shadow output and theme shadow-role usage;
4. computed browser shadow on the actual paint boundary;
5. component geometry/clipping/accessibility after integration changes;
6. unit/type/build and Chromium visual regression.
