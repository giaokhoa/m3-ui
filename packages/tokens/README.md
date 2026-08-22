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

## Dynamic color

`ThemeProvider` owns actual runtime Material colors. Canonical component colors are ordinary DTCG strings containing CSS role references such as `var(--primary)`. There is no static fallback color and no `$extensions` metadata. Non-color design values are generated as static JS/TypeScript values and are not generic root CSS variables.

A runtime theme override such as the global font family may still use CSS inheritance/custom properties; that is runtime theming, not a second token transport layer.

## Style Dictionary API

Style Dictionary 5.5.2 is the sole build engine. `style-dictionary.config.mjs` reads only `tokens/**/*.json` and emits `dist/generated/tokens.js` plus `tokens.d.ts` using built-in formats. The package root points directly to those artifacts.

UI foundations should consume the package root directly. The old core convenience subpaths `./motion`, `./ripple`, `./state`, and `./typography` are intentionally removed: ergonomic object projection belongs at the actual runtime consumer, not in a second token API layer.

A small set of component/elevation compatibility facades remains temporarily while their consumers are migrated. Those files may reshape generated values or convert CSS lengths/durations to numbers for existing arithmetic APIs, but may never own immutable design values. Architecture tests enforce this boundary and explicitly keep retired facades deleted.

## Upstream audit

AndroidX revision and file mappings live under `scripts/androidx/` and `audit-androidx.mjs`. The audit fetches pinned files, parses them in memory, normalizes semantic values, and compares them against canonical tokens. It has no renderer and no write path into `tokens/` or `src/`.

Colors are audited by semantic role identity (`Primary` ↔ `var(--primary)`), not by static hex values. Web-only/runtime adaptations are audited only when an upstream token actually owns the same semantic value; Defaults/layout behavior belongs in independent parity tests.

## Forbidden regressions

Do **not** reintroduce: `scripts/compose-sync`; `src/generated/androidx`; retired core token facades; upstream files as Style Dictionary `source`/`include`; generators that write canonical DTCG; custom TypeScript generators duplicating Style Dictionary built-ins; static hex placeholders for ThemeProvider-owned roles; generic CSS-variable output for non-color immutable tokens; or handwritten design constants where a canonical token exists.

If a future requirement appears to need one of these, treat it as an architecture change requiring explicit review rather than silently reviving the old direction.

## Validation and audit commands

- `pnpm --filter @m3/tokens validate` validates the canonical graph.
- `pnpm --filter @m3/tokens test` cleans generated output, runs Style Dictionary, generated-output tests, AndroidX-parser tests, and architecture guards.
- `pnpm --filter @m3/tokens audit:androidx` performs the pinned read-only upstream audit.

See `/.agents/skills/style-dictionary/SKILL.md` and `/docs/architecture/README.md` before changing the token pipeline.
