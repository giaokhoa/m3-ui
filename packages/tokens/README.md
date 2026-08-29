# Tokens

Target publish scope: `@m3-ui/tokens`. The workspace keeps `@m3-ui/tokens` until the repository-wide namespace migration is done atomically.

## Source of truth

`tokens/**/*.json` is the only authoritative immutable design-token source. Canonical files use plain DTCG `$type` / `$value` and are split by semantic ownership.

```text
tokens/
├── core/
│   ├── color.json
│   ├── state.json
│   ├── elevation.json
│   ├── shape.json
│   ├── typography.json
│   ├── motion.json
│   └── ripple.json
└── component/
    ├── button/
    ├── card.json
    ├── checkbox.json
    ├── chip/
    ├── radio-button.json
    ├── switch.json
    └── ...
```

Style Dictionary deep-merges these files into one graph. Duplicate canonical paths are rejected. AndroidX Compose, the Material 3 Figma Design Kit, Material Web, Material Components Android, Flutter Material, and other upstreams are read-only references; audit evidence never becomes a build input.

This is intentionally a **single-source build / multi-reference audit** architecture.

## Runtime color architecture

`ThemeProvider` owns the actual runtime Material color scheme. It emits scoped CSS custom properties such as `--primary`, `--on-primary`, `--surface`, and `--outline` from the active baseline or dynamic Material Color Utilities scheme.

Style Dictionary does **not** own the concrete runtime color values. It owns the semantic relationship between component tokens and runtime roles.

Core color roles terminate in runtime CSS expressions:

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

Component colors must alias those canonical roles rather than copy the CSS expression:

```json
{
  "component": {
    "button": {
      "variant": {
        "filled": {
          "containerColor": {
            "$type": "string",
            "$value": "{color.role.primary}"
          }
        }
      }
    }
  }
}
```

The intended chain is therefore:

```text
component token
    -> canonical runtime color role
    -> var(--role)
    -> ThemeProvider concrete runtime value
```

This mirrors the Material 3 responsibility split: component defaults point to semantic/system roles while the active theme resolves those roles.

Do not replace runtime roles with static hex placeholders. Do not duplicate `var(--role)` in component tokens when the role already exists. UI code must not decode `var(--role)` into a semantic name and reconstruct it later.

## Style Dictionary outputs

Style Dictionary 5.5.2 is the build engine. The generated package root remains the typed JS/TypeScript token vocabulary:

```text
dist/generated/tokens.js
dist/generated/tokens.d.ts
```

The token package has no handwritten runtime `src/` layer.

A platform-specific generated artifact is also allowed when it has a concrete consumer. The first reference implementation is Button CSS:

```text
canonical Button tokens
    -> Style Dictionary CSS platform
    -> dist/generated/button.css
    -> @m3-ui/tokens/button.css
    -> Button
```

That CSS adapter serializes static component defaults and variant/size mappings. It does not generate the active color scheme; color declarations still resolve to ThemeProvider variables such as `var(--primary)`.

The goal is to avoid this runtime-only projection pattern:

```text
DTCG -> flat JS constants -> large handwritten *.defaults.ts table -> inline CSS vars
```

for values that can be compiled once into static component CSS.

JavaScript projections remain appropriate only when JavaScript genuinely needs the value for behavior, arithmetic, interaction history, DOM geometry, or user-supplied runtime overrides.

## Button reference slice

Button is the first migration test for this architecture.

Static ownership moves to generated CSS:

- baseline dimensions and padding;
- variant colors and outlines;
- expressive size dimensions;
- typography metrics selected by the canonical role;
- icon dimensions and spacing;
- default container radius.

Runtime TypeScript keeps only behavior that needs state:

- elevation level selection;
- incoming/outgoing elevation transition timing;
- user-supplied normal/pressed shape overrides;
- pressed-shape transition behavior.

Once Button passes token tests, UI tests, build/typecheck, and visual regression, its pattern can be evaluated before migrating other components.

## Upstream audit

Upstreams remain audit oracles only:

```text
AndroidX / Figma / Material Web / other references
                  |
                  v
          normalize/read in memory
                  |
                  v
          compare with canonical DTCG
```

Reference snapshots, source pins, drift manifests, and audit scripts remain outside `tokens/**/*.json`. Cross-source disagreement is preserved as explicit drift evidence rather than silently rewriting canonical values.

Runtime colors are audited by semantic role identity first. Baseline light/dark and contrast evidence may additionally compare concrete values when the upstream owns the same scheme.

## Forbidden regressions

Do not reintroduce:

- `packages/tokens/src/` or handwritten token facades;
- upstream files as Style Dictionary `source` / `include`;
- generators that rewrite canonical DTCG from external sources;
- static hex placeholders for ThemeProvider-owned roles;
- duplicated component `var(--role)` strings instead of aliases;
- decode/re-encode helpers for runtime color expressions;
- generic global CSS-variable dumps for every immutable token without a real consumer;
- handwritten design constants where a canonical token exists;
- hand-edited generated output.

## Validation and audit commands

- `pnpm --filter @m3-ui/tokens validate`
- `pnpm --filter @m3-ui/tokens test`
- `pnpm --filter @m3-ui/tokens audit:androidx`
- `pnpm --filter @m3-ui/tokens exec node scripts/audit-material-web-declaration-module-coverage.mjs --require-complete`
- `pnpm --filter @m3-ui/tokens exec node scripts/audit-drift-registry.mjs --require-complete`
- `pnpm --filter @m3-ui/tokens exec node scripts/audit-figma-reference.mjs --require-complete`
- `pnpm --filter @m3-ui/tokens exec node --test scripts/figma-color-scheme.test.mjs`
- `pnpm --filter @m3-ui/tokens exec node --test scripts/figma-color-contrast.test.mjs`
- `pnpm --filter @m3-ui/tokens exec node --test scripts/motion-reference-evidence.test.mjs`
- `pnpm --filter @m3-ui/tokens exec node --test scripts/elevation-reference-evidence.test.mjs`

See `/.agents/skills/style-dictionary/SKILL.md`, `/packages/ui/src/theme/README.md`, and `/docs/architecture/README.md` before changing the token/theme boundary.
