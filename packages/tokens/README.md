# Tokens

Target publish scope: `@m3-ui/tokens`. The workspace keeps `@m3/tokens` until the repository-wide namespace migration is done atomically.

## Source of truth

`tokens/**/*.json` is the only authoritative immutable design-token source. Canonical files use plain DTCG `$type` / `$value`, contain no project-specific provenance metadata, and are split by semantic ownership only for maintainability.

```text
tokens/
├── core/
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
    └── text-field/
```

Style Dictionary deep-merges these files into one graph. Duplicate canonical paths are rejected. Canonical files are repository build inputs, not published package source files.

AndroidX Compose, the Material 3 Figma Design Kit, Material Web, and other upstreams are read-only references. Audit code owns source revision/mapping information; upstream data never generates or rewrites canonical or runtime token files.

## Token ownership

Canonical tokens represent stable design values, not every literal used by implementation code.

- Reusable Material semantics belong in `core/`.
- Component-owned immutable values belong in `component/`.
- A deliberate stable web visual contract may also be a component token even when Compose has no equivalent. For example, `component.switch.labelGap` belongs to the web label rendered by this library and therefore has no AndroidX audit mapping.
- Values derived arithmetically from canonical tokens remain runtime derivations rather than duplicate tokens.
- Pure DOM/CSS mechanics and accessibility fallbacks stay in `@m3/ui`; examples include centering percentages and forced-colors system outlines.
- Never alias two tokens merely because their numeric values are equal. An alias means shared semantic identity.

## Dynamic color

`ThemeProvider` owns actual runtime Material colors. Canonical component colors are ordinary DTCG strings containing CSS role references such as `var(--primary)`. There is no static fallback color and no `$extensions` metadata. Non-color design values are generated as static JS/TypeScript values and are not generic root CSS variables.

A runtime theme override such as the global font family may still use CSS inheritance/custom properties; that is runtime theming, not a second token transport layer.

## Style Dictionary API

Style Dictionary 5.5.2 is the sole build engine. `style-dictionary.config.mjs` reads only `tokens/**/*.json` and emits `dist/generated/tokens.js` plus `tokens.d.ts` using built-in formats.

The package root is the **only runtime API**. There is no handwritten `src/` layer, no `./generated` alias, and no component/elevation convenience subpaths. UI code imports `@m3/tokens` directly. Ergonomic projections needed for arithmetic or component behavior live beside their consumers in `@m3/ui` and may only derive from generated values.

This boundary is intentional: `@m3/tokens` publishes the canonical generated vocabulary; it does not maintain a second object-shaped token API.

## Upstream audit

AndroidX revision and file mappings live under `scripts/androidx/` and `audit-androidx.mjs`. The audit fetches pinned files, parses them in memory, normalizes semantic values, and compares them against canonical tokens. It has no renderer and no write path into `tokens/`.

Colors are audited by semantic role identity (`Primary` ↔ `var(--primary)`), not by static hex values. Web-only/runtime adaptations are audited only when an upstream token actually owns the same semantic value; Defaults/layout behavior belongs in independent parity tests.

## Forbidden regressions

Do **not** reintroduce: a handwritten token runtime `src/` layer; token-package compatibility facades or subpath aliases; `scripts/compose-sync`; `src/generated/androidx`; upstream files as Style Dictionary `source`/`include`; generators that write canonical DTCG; custom TypeScript generators duplicating Style Dictionary built-ins; static hex placeholders for ThemeProvider-owned roles; generic CSS-variable output for non-color immutable tokens; or handwritten design constants where a canonical token exists.

If a future requirement appears to need one of these, treat it as an architecture change requiring explicit review rather than silently reviving the old direction.

## Validation and audit commands

- `pnpm --filter @m3/tokens validate` validates the canonical graph.
- `pnpm --filter @m3/tokens test` cleans generated output, runs Style Dictionary, generated-output tests, AndroidX-parser tests, and architecture guards.
- `pnpm --filter @m3/tokens audit:androidx` performs the pinned read-only upstream audit.

See `/.agents/skills/style-dictionary/SKILL.md` and `/docs/architecture/README.md` before changing the token pipeline.
