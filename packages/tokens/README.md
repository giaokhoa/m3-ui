# @m3-ui/tokens

`@m3-ui/tokens` contains the canonical Material 3 design-token graph, the Style Dictionary build, generated package artifacts, validation and read-only upstream audits.

This README documents how the token package is structured and executed. Agent token/compiler rules live in `.agents/skills/material3-parity/SKILL.md` and `.agents/skills/style-dictionary/SKILL.md`.

## Source layout

Canonical tokens live under `tokens/` and use DTCG `$type` / `$value` syntax.

```text
tokens/
├── core/
│   ├── color.json
│   ├── state.json
│   ├── elevation.json
│   ├── shape.json
│   ├── typography.json
│   ├── motion.json
│   ├── ripple.json
│   └── ...
├── theme/
│   └── baseline.json
└── component/
    ├── button/
    ├── card.json
    ├── checkbox.json
    ├── chip/
    ├── text-field/
    ├── radio-button.json
    ├── switch.json
    └── ...
```

Style Dictionary deep-merges the canonical files into one graph. Duplicate paths, broken references and invalid source structure are checked by the package validation/tests.

AndroidX Compose, the Material 3 Figma kit, Material Web and other Material implementations are audit references. Audit scripts normalize those sources and compare them with canonical DTCG; they are not part of the Style Dictionary source graph.

## Build flow

```text
canonical DTCG
      │
      ▼
Style Dictionary 5.5.2
      │
      ├── dist/generated/tokens.js
      ├── dist/generated/tokens.d.ts
      └── reviewed CSS adapters
```

The package root exports the generated JS/TypeScript vocabulary:

```ts
import * as token from '@m3-ui/tokens';
```

Current reviewed CSS adapter exports include:

```text
@m3-ui/tokens/theme.css
@m3-ui/tokens/button.css
@m3-ui/tokens/chip.css
@m3-ui/tokens/text-field.css
@m3-ui/tokens/elevation.css
@m3-ui/tokens/ripple.css
```

Generated files are centralized under `dist/generated/`. `packages/ui` consumes them directly or inlines them into self-contained public style entries during its style build.

## Theme foundation output

Immutable Material baseline light/dark role values live in `tokens/theme/baseline.json`. The normal generated JS vocabulary exposes those values for JavaScript consumers such as the public `ColorScheme` view, while `dist/generated/theme.css` serializes the static browser foundation.

The generated theme adapter owns:

- baseline light and dark system-role CSS variables;
- the matching `color-scheme` declaration;
- default Material plain/brand font-family variables and the default plain font family.

`ThemeProvider` marks its normal and portal scopes with `data-m3-theme` / `data-theme`. When no `sourceColor` exists, those scopes receive baseline values from generated CSS. When `sourceColor` exists, the provider emits runtime role variables inline, which override the generated baseline through normal CSS precedence.

The UI modular-style build prepends this generated theme foundation to every self-contained `@m3-ui/ui/styles/*.css` component entry.

## Runtime color flow

Material component color tokens reference semantic color-role tokens. Core color roles terminate in scoped runtime CSS variables supplied by the active theme scope.

Example canonical role endpoint:

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

Example component alias:

```json
{
  "containerColor": {
    "$type": "string",
    "$value": "{color.role.primary}"
  }
}
```

The resulting runtime chain is:

```text
component token
    -> color.role.primary
    -> var(--primary)
    -> active theme scope concrete value
```

This lets `sourceColor`, mode and contrast change concrete system colors at runtime without rebuilding component token mappings.

## Component CSS adapters

Generated CSS adapters serialize static token-to-browser bindings for concrete consumers. Handwritten UI CSS remains responsible for component structure/layout and consumes the generated private variables/selectors.

Reference slices currently in the repository:

- Theme: generated baseline system roles and typeface foundation, with dynamic color overrides in `ThemeProvider`.
- Button: generated size/variant/typography/color geometry plus runtime interaction/elevation logic in UI code.
- Chip: generated static color/state mappings with runtime interaction and slot-dependent behavior in UI code.
- TextField: generated shared + filled/outlined static default matrix.
- Elevation: generated immutable shadow recipes selected by semantic runtime elevation level.
- Ripple: generated immutable state-layer/motion/focus styling with runtime wave geometry/lifecycle.

Issue #150 tracks expansion of this generated-adapter pattern across the remaining component surfaces.

## Upstream audit structure

Audit and reference tooling lives under `scripts/`. The package maintains pinned/material-specific inventories, semantic mappings, drift evidence and coverage checks independently from the canonical build input.

The high-level flow is:

```text
AndroidX / Figma / Material Web / other evidence
                    │
                    ▼
            normalize in memory
                    │
                    ▼
             semantic comparison
                    │
                    ▼
              canonical DTCG
```

Cross-source disagreements are retained as explicit audit/drift evidence rather than hidden by the build.

## Commands

Build and validate:

```bash
pnpm --filter @m3-ui/tokens validate
pnpm --filter @m3-ui/tokens build
pnpm --filter @m3-ui/tokens test
```

Common audits:

```bash
pnpm --filter @m3-ui/tokens audit:androidx
pnpm --filter @m3-ui/tokens coverage:compose:complete
pnpm --filter @m3-ui/tokens coverage:material-web:complete
pnpm --filter @m3-ui/tokens coverage:union:complete
```

Additional focused audit commands are defined in `packages/tokens/package.json` and under `scripts/`.

## Related implementation docs

- Theme runtime: `packages/ui/src/theme/README.md`
- Elevation renderer: `packages/ui/src/internal/elevation/README.md`
- Ripple/state layer: `packages/ui/src/internal/ripple/README.md`
- Layout tokens and adaptive implementation: `packages/ui/src/layout/README.md`

For agents, start from root `AGENTS.md` rather than treating this README as the implementation-policy contract.
