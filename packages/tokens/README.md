# Tokens

Target publish scope: `@m3-ui/tokens`. The workspace keeps `@m3-ui/tokens` until the repository-wide namespace migration is done atomically.

## Source of truth

`tokens/**/*.json` is the only authoritative immutable design-token source. Canonical files use plain DTCG `$type` / `$value` and are split by semantic ownership. Style Dictionary deep-merges these files into one graph. Duplicate canonical paths are rejected. AndroidX Compose, the Material 3 Figma Design Kit, Material Web, Material Components Android, Flutter Material, and other upstreams are read-only references; audit evidence never becomes a build input.

This is intentionally a **single-source build / multi-reference audit** architecture.

## Runtime color architecture

`ThemeProvider` owns the actual runtime Material color scheme. It emits scoped CSS custom properties such as `--primary`, `--on-primary`, `--surface`, `--outline`, and `--shadow` from the active baseline or dynamic Material Color Utilities scheme.

Style Dictionary does **not** own the concrete runtime color values. It owns the semantic relationship between component/effect tokens and runtime roles. Core color roles terminate in runtime CSS expressions; component/effect colors must alias those canonical roles rather than copy the CSS expression.

```text
component/effect token
    -> canonical runtime color role
    -> var(--role)
    -> ThemeProvider concrete runtime value
```

Do not replace runtime roles with static hex placeholders. Do not duplicate `var(--role)` in component/effect tokens when the role already exists. UI code must not decode `var(--role)` into a semantic name and reconstruct it later.

## Style Dictionary outputs

Style Dictionary 5.5.2 is the build engine. The generated package root remains `dist/generated/tokens.js` plus `tokens.d.ts`; the token package has no handwritten runtime `src/` layer.

Current reviewed platform adapters are:

```text
dist/generated/button.css
dist/generated/chip.css
dist/generated/text-field.css
dist/generated/elevation.css
dist/generated/ripple.css
```

They are exported as `@m3-ui/tokens/button.css`, `@m3-ui/tokens/chip.css`, `@m3-ui/tokens/text-field.css`, `@m3-ui/tokens/elevation.css`, and `@m3-ui/tokens/ripple.css`.

Generated adapters serialize immutable token-to-platform bindings. They do not generate the active theme/color scheme and must not define ThemeProvider-owned roles such as `--primary`, `--secondary`, or `--shadow`.

JavaScript projections remain appropriate only when JavaScript genuinely needs the value for behavior, arithmetic, interaction history, DOM geometry, timers/lifecycle, or user-supplied runtime overrides.

## Reference component slices

Button established the component-token adapter pattern: canonical Button tokens -> Style Dictionary -> `button.css` -> handwritten Button structural CSS. Static ownership includes baseline geometry, variant color/outline mapping, expressive sizes, typography metrics, icon dimensions/spacing, and default radius. Runtime TypeScript keeps interaction precedence/history, elevation level/transition selection, and user-supplied pressed-shape behavior.

Chip applies the same boundary to its immutable color/outline state matrix while retaining interaction/elevation behavior, callsite-dependent shapes, slot-dependent spacing/padding, and avatar opacity in runtime TypeScript.

TextField has no runtime need for its immutable base-default projection, so the compiler owns the full shared + filled/outlined base matrix: dimensions, typography, motion, colors, disabled opacity, padding, shape, and indicator/outline defaults. React Aria/CSS still own runtime state semantics. This removes the old `DTCG -> colorRole() -> roleVariable() -> inline CSS vars` chain entirely.

## Elevation adapter

React chooses the semantic elevation level from runtime interaction state. Style Dictionary serializes immutable shadow geometry/opacities into `dist/generated/elevation.css`. The generated adapter defaults its private shadow color to `var(--shadow)`; `ThemeProvider` supplies the concrete role value. The canonical three-layer shadow recipe is intentionally preserved while the known two-layer Material Web/Figma renderer difference remains explicit cross-source drift.

## Ripple adapter

Generated `dist/generated/ripple.css` owns immutable state-layer opacities, motion/easing values, and focus-ring stroke/inset/color/motion bindings. `useRipple()` retains runtime geometry, measurement, active-wave lifetime, and release scheduling. Ripple focus-ring colors alias canonical `Secondary` / `OnSecondary` roles.

## Public modular style self-containment

`@m3-ui/ui/styles/*.css` exports remain self-contained. The UI style build expands shared primitive/generated dependencies before the handwritten CSS that consumes their private variables. Generated artifacts remain centralized under `packages/tokens/dist/generated/`.

## Change-local documentation contract

Before changing a foundation, read the matching contract: `/.agents/skills/style-dictionary/SKILL.md`, this README, `/docs/architecture/README.md`, the relevant component/foundation README, and `/packages/ui/src/theme/README.md`. If ownership, injection, generated output, runtime responsibilities, or an escape hatch changes, update the local contract in the same PR and add/update an executable architecture guard when practical.

## Upstream audit

Upstreams remain audit oracles only. Reference snapshots, source pins, drift manifests, and audit scripts remain outside `tokens/**/*.json`. Cross-source disagreement is preserved as explicit drift evidence rather than silently rewriting canonical values.

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

See the local architecture contracts above before changing token/theme/effect boundaries.
