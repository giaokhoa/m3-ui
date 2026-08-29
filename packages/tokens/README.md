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

`ThemeProvider` owns the actual runtime Material color scheme. It emits scoped CSS custom properties such as `--primary`, `--on-primary`, `--surface`, `--outline`, and `--shadow` from the active baseline or dynamic Material Color Utilities scheme.

Style Dictionary does **not** own the concrete runtime color values. It owns the semantic relationship between component/effect tokens and runtime roles.

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

Component/effect colors must alias those canonical roles rather than copy the CSS expression:

```json
{
  "containerColor": {
    "$type": "string",
    "$value": "{color.role.primary}"
  }
}
```

The intended chain is therefore:

```text
component/effect token
    -> canonical runtime color role
    -> var(--role)
    -> ThemeProvider concrete runtime value
```

This mirrors the Material 3 responsibility split: component defaults point to semantic/system roles while the active theme resolves those roles.

Do not replace runtime roles with static hex placeholders. Do not duplicate `var(--role)` in component/effect tokens when the role already exists. UI code must not decode `var(--role)` into a semantic name and reconstruct it later.

## Style Dictionary outputs

Style Dictionary 5.5.2 is the build engine. The generated package root remains the typed JS/TypeScript token vocabulary:

```text
dist/generated/tokens.js
dist/generated/tokens.d.ts
```

The token package has no handwritten runtime `src/` layer.

Platform-specific generated CSS artifacts are allowed only when they have concrete consumers. Current reviewed adapters are centralized together:

```text
dist/generated/button.css
dist/generated/elevation.css
dist/generated/ripple.css
```

They are exported as:

```text
@m3-ui/tokens/button.css
@m3-ui/tokens/elevation.css
@m3-ui/tokens/ripple.css
```

Generated adapters serialize immutable token-to-platform bindings. They do not generate the active theme/color scheme and must not define ThemeProvider-owned roles such as `--primary`, `--secondary`, or `--shadow`.

The goal is to avoid this runtime-only projection pattern:

```text
DTCG -> flat JS constants -> handwritten projection table -> inline CSS vars/box-shadow
```

for values that can be compiled once into static platform CSS.

JavaScript projections remain appropriate only when JavaScript genuinely needs the value for behavior, arithmetic, interaction history, DOM geometry, timers/lifecycle, or user-supplied runtime overrides.

## Button reference slice

Button established the component-token adapter pattern:

```text
canonical Button tokens
    -> Style Dictionary
    -> dist/generated/button.css
    -> handwritten Button structural CSS
```

Static ownership includes baseline geometry, variant color/outline mapping, expressive sizes, typography metrics, icon dimensions/spacing, and default radius.

Runtime TypeScript keeps interaction precedence/history, elevation level/transition selection, and user-supplied pressed-shape behavior. Button now renders the shared `<Elevation>` primitive rather than serializing the canonical shadow recipe into its root inline style.

Connected ButtonGroup still uses the old inline elevation compatibility path while it awaits its own component migration. That path is explicit migration debt and is frozen by the architecture allowlist; it is not a model for new code.

## Elevation adapter

```text
canonical elevation levels + shadow layers
    -> Style Dictionary
    -> dist/generated/elevation.css
    -> <Elevation data-elevation="levelN">
    -> handwritten internal/elevation/elevation.css
```

React chooses the semantic level from runtime interaction state. Style Dictionary serializes the immutable shadow geometry/opacities. The generated adapter defaults its private shadow color to `var(--shadow)`; `ThemeProvider` supplies the concrete role value.

The canonical three-layer shadow recipe is intentionally preserved. Pinned Figma/Material Web evidence currently uses a different two-layer web renderer recipe; this remains tracked cross-source drift and must not be silently resolved by a formatter change. See `packages/ui/src/internal/elevation/README.md` and `scripts/elevation-reference-evidence.test.mjs`.

## Ripple adapter

```text
canonical ripple/state/focus-ring tokens
    -> Style Dictionary
    -> dist/generated/ripple.css
    -> <Ripple>
    -> handwritten internal/ripple/ripple.css
```

Generated CSS owns immutable state-layer opacities, motion/easing values, and focus-ring stroke/inset/color/motion bindings. `useRipple()` retains runtime geometry, measurement, active-wave lifetime, and release scheduling.

Ripple focus-ring colors alias canonical `Secondary` / `OnSecondary` roles; the core role endpoints resolve those aliases to ThemeProvider CSS variables.

## Public modular style self-containment

`@m3-ui/ui/styles/*.css` exports remain self-contained. The UI style build expands shared primitive dependencies so generated adapters are inlined before the handwritten CSS that consumes their private variables.

This build composition does not move generated files out of the token package. Generated artifacts remain centralized under `packages/tokens/dist/generated/`.

## Change-local documentation contract

Before changing a foundation, read the matching contract:

- token/compiler boundary: `/.agents/skills/style-dictionary/SKILL.md` and this README;
- repository-wide architecture: `/docs/architecture/README.md`;
- elevation: `/packages/ui/src/internal/elevation/README.md`;
- ripple/state layer/focus indication: `/packages/ui/src/internal/ripple/README.md`;
- runtime theme/color ownership: `/packages/ui/src/theme/README.md`.

If ownership, injection, generated output, runtime responsibilities, or an escape hatch changes, update the local contract in the same PR and add/update an executable architecture guard when practical.

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
- duplicated component/effect `var(--role)` strings instead of aliases;
- decode/re-encode helpers for runtime color expressions;
- generic global CSS-variable dumps for every immutable token without a real consumer;
- new React serializers for static elevation shadow geometry or Ripple styling constants;
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

See the local architecture contracts above before changing token/theme/effect boundaries.
