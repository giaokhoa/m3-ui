---
name: style-dictionary
description: Use when editing @m3-ui/tokens canonical DTCG files, Style Dictionary configuration, generated token output, token ownership, formats, audits, or token package structure.
---

# Style Dictionary

Read `.agents/skills/material3-parity/SKILL.md` first. This skill specializes its token/compiler rules for `@m3-ui/tokens` and Style Dictionary work.

Package structure, generated outputs and commands are documented in `packages/tokens/README.md`.

## Compiler contract

```text
canonical DTCG
    │
    ▼
Style Dictionary
    ├── typed JS/TS values
    └── reviewed platform CSS adapters

ThemeProvider
    └── concrete runtime Material system-role values
```

Style Dictionary owns immutable token semantics and platform serialization. `ThemeProvider` owns runtime concrete system colors. These flows meet through role CSS variables but are not interchangeable.

## Canonical graph rules

- `packages/tokens/tokens/**/*.json` is the only canonical immutable token source.
- `core/` owns shared foundations and canonical runtime role endpoints.
- `component/` owns component-specific semantic tokens and aliases.
- aliases represent semantic identity, not merely numeric deduplication.
- AndroidX/Figma/Material Web/other evidence stays in audit tooling and never enters Style Dictionary `source` or `include`.
- generated output is disposable build output and is never hand-edited.
- do not create a handwritten `packages/tokens/src/` compatibility/token layer.

## Runtime color model

Core role endpoints resolve to ThemeProvider-owned CSS variables, for example:

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

Component tokens alias the canonical role:

```json
{
  "containerColor": {
    "$type": "string",
    "$value": "{color.role.primary}"
  }
}
```

Result:

```text
component.button.*.containerColor
    -> color.role.primary
    -> var(--primary)
    -> ThemeProvider runtime value
```

Do not duplicate `var(--role)` in component/effect tokens, replace runtime roles with static hex placeholders, or decode CSS role strings in UI TypeScript to recover semantic names.

## Platform adapter policy

A generated CSS adapter is appropriate when a concrete UI consumer needs static token-to-browser bindings.

Good candidates include:

- component variant/size/state matrices;
- dimensions and spacing;
- typography metrics;
- static shape/radius defaults;
- semantic color-role bindings;
- disabled opacity / browser-expressible `color-mix()` bindings;
- static motion/easing/duration;
- elevation shadow recipes;
- ripple state-layer/focus styling.

Generated adapters stay under `packages/tokens/dist/generated/` and may be exported as token-package CSS subpaths. `packages/ui` keeps handwritten structural/state CSS and may inline generated dependencies into its self-contained public style entries.

Do not generate a generic global dump of every non-color token when no platform consumer needs it.

## Runtime boundary

Do not use Style Dictionary to force genuinely live behavior into static CSS.

TypeScript remains appropriate for:

- interaction precedence/history;
- runtime semantic elevation selection;
- DOM measurement;
- pointer/ripple geometry;
- timers/lifecycle;
- arithmetic involving live props/current values/measurements;
- genuine runtime user overrides.

Conversely, a token being consumed by TypeScript is not automatically legitimate: if the code only converts an immutable token to an inline CSS variable/string on every render, prefer a generated platform adapter.

## Interaction-effect adapters

### Elevation

- DTCG owns semantic levels and immutable shadow geometry/opacities.
- generated `elevation.css` serializes the paint recipe.
- runtime code selects semantic level/transition when interaction history requires it.
- the generated recipe may reference `var(--shadow)`; it does not define the concrete `--shadow` role.

The current canonical three-layer recipe remains authoritative while the pinned Figma/Material Web two-layer renderer difference is tracked as audit drift.

### Ripple

- generated `ripple.css` owns immutable state-layer opacity, motion/easing and focus-ring bindings.
- `useRipple()` owns runtime geometry, measurement, wave identity and release lifecycle.
- React Aria/native host interactions remain the interaction source rather than adding a competing listener state machine inside the shared primitive.

## DTCG authoring

- use `$value`, not legacy `value`;
- use `$type` explicitly or inherit only from an unambiguous group;
- dimension tokens use explicit value/unit objects;
- aliases use `{path.to.token}`;
- provenance and upstream revisions belong in audit code rather than canonical token JSON;
- add `$extensions` only for a reviewed cross-tool need.

Keep the repository's own validation layer even as DTCG stable-spec validation improves. Issue #150 tracks adding stronger stable-spec conformance without replacing m3-ui-specific architecture checks.

## Style Dictionary configuration

The active configuration is `packages/tokens/style-dictionary.config.mjs`.

Maintain these properties:

- canonical `source` remains `tokens/**/*.json`;
- collisions/warnings/broken references fail rather than silently generating bad output;
- generated headers/output are deterministic;
- JS/TS and CSS adapters compile from the same graph;
- each extra platform/format has a concrete consumer and focused tests.

Custom formats are expected where browser serialization requires component selectors/state matrices that generic formats cannot express clearly.

For a DTCG dictionary, read transformed values from `token.$value`. If a formatter is deliberately shared with non-DTCG dictionaries, branch explicitly on `options.usesDtcg`. Treat unexpected `undefined` as a formatter error rather than serializing it.

When refactoring formatter internals, prefer Style Dictionary's `dictionary.tokenMap` for lookup rather than rebuilding equivalent maps from `dictionary.allTokens` when practical.

As adapter count grows, formatter helpers and per-component adapter modules may be split into maintainable files while keeping Style Dictionary as the single build pipeline.

## Validation protocol

For token/compiler changes, verify the relevant subset of:

```bash
pnpm --filter @m3-ui/tokens validate
pnpm --filter @m3-ui/tokens build
pnpm --filter @m3-ui/tokens test
pnpm --filter @m3-ui/tokens audit:androidx
pnpm --filter @m3-ui/tokens coverage:compose:complete
pnpm --filter @m3-ui/tokens coverage:material-web:complete
pnpm --filter @m3-ui/tokens coverage:union:complete
```

Also verify affected UI unit/type/build tests and Storybook visual regression when generated styling changes rendering.

Check that generated output, token package exports, UI imports and modular-style dependency order remain consistent.

## Forbidden regressions

Do not:

- create `packages/tokens/src/`;
- add upstream evidence to Style Dictionary build inputs;
- generate/rewrite canonical DTCG from upstream snapshots;
- copy `var(--role)` instead of aliasing canonical role tokens;
- resolve dynamic Material system colors inside component code;
- create handwritten token facades that duplicate generated output;
- create a second custom build/generator when a Style Dictionary format/platform is the correct stage;
- serialize immutable shadow/ripple/component static values through React solely because generated JS values exist;
- hand-edit `dist/**`.

If a compiler change would alter the repository-wide static/runtime ownership model, stop and apply the architecture-revisit procedure in `material3-parity` rather than deciding it locally in this skill.
