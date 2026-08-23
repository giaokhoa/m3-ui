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

This is intentionally a **single-source build / multi-reference audit** architecture:

- Style Dictionary reads only `tokens/**/*.json`.
- Compose, Material Web, and Figma metadata live outside `tokens/` and therefore cannot enter generated output.
- Cross-source disagreements are preserved as explicit drift records instead of being merged into a second token graph.
- CI verifies that all reconciled Material Web modules are covered by strict declaration audits and that the strict-audit module union still equals the reconciled module set.
- CI scans every `*-drift.json` manifest, normalizes both `records` and `drift` schemas (including nested foundation drift), validates referenced canonical paths, detects duplicate drift IDs, and rejects stale pinned Compose/Material Web revisions.
- CI also validates the pinned Figma evidence snapshot against `scripts/sources.mjs`; it never needs Figma credentials and never consumes Figma data as a token build input.

The result is one Style Dictionary source of truth with independently measurable source drift, rather than several upstream token corpora being merged at build time.

## Dynamic color

`ThemeProvider` owns actual runtime Material colors. Canonical component colors are ordinary DTCG strings containing CSS role references such as `var(--primary)`. There is no static fallback color and no `$extensions` metadata. Non-color design values are generated as static JS/TypeScript values and are not generic root CSS variables.

A runtime theme override such as the global font family may still use CSS inheritance/custom properties; that is runtime theming, not a second token transport layer.

## Style Dictionary API

Style Dictionary 5.5.2 is the sole build engine. `style-dictionary.config.mjs` reads only `tokens/**/*.json` and emits `dist/generated/tokens.js` plus `tokens.d.ts` using built-in formats.

The package root is the **only runtime API**. There is no handwritten `src/` layer, no `./generated` alias, and no component/elevation convenience subpaths. UI code imports `@m3/tokens` directly. Ergonomic projections needed for arithmetic or component behavior live beside their consumers in `@m3/ui` and may only derive from generated values.

This boundary is intentional: `@m3/tokens` publishes the canonical generated vocabulary; it does not maintain a second object-shaped token API.

## Upstream audit

AndroidX revision and file mappings live under `scripts/androidx/` and `audit-androidx.mjs`. Material Web inventory/declaration auditors use the pinned generated Sass corpus. Shared source pins live in `scripts/sources.mjs`. The audits fetch pinned files, parse them in memory, normalize semantic values, and compare them against canonical tokens. They have no renderer and no write path into `tokens/`.

Colors are audited by semantic role identity (`Primary` ↔ `var(--primary)`), not by static hex values. Web-only/runtime adaptations are audited only when an upstream token actually owns the same semantic value; Defaults/layout behavior belongs in independent parity tests.

Cross-source exceptions live under `audit/*-drift.json`. `scripts/audit-drift-registry.mjs` treats those files as an audit registry rather than a build input. It reports drift by classification and source manifest while failing malformed records, stale pinned revisions, duplicate IDs, or `canonicalPath` references that no longer exist in the Style Dictionary graph.

Figma remains a design reference rather than a build source. `scripts/sources.mjs` pins the Material 3 Design Kit library/version metadata. `audit/figma-reference-evidence.json` records a small, explicit read-only sample retrieved from that exact published library through Figma design-system search: Typescale variables, Shape corner variables, display text styles, and key-color fill styles. `scripts/audit-figma-reference.mjs` verifies that this evidence still agrees with the repository source pin, has valid unique Figma asset keys, and contains the expected representative families. The temporary Figma file used only to provide connector search context is deliberately not persisted in repository metadata. Figma observations may support drift classification, but neither the evidence snapshot nor live Figma ever rewrites DTCG tokens.

## Forbidden regressions

Do **not** reintroduce: a handwritten token runtime `src/` layer; token-package compatibility facades or subpath aliases; `scripts/compose-sync`; `src/generated/androidx`; upstream files as Style Dictionary `source`/`include`; generators that write canonical DTCG; custom TypeScript generators duplicating Style Dictionary built-ins; static hex placeholders for ThemeProvider-owned roles; generic CSS-variable output for non-color immutable tokens; or handwritten design constants where a canonical token exists.

If a future requirement appears to need one of these, treat it as an architecture change requiring explicit review rather than silently reviving the old direction.

## Validation and audit commands

- `pnpm --filter @m3/tokens validate` validates the canonical graph.
- `pnpm --filter @m3/tokens test` cleans generated output, runs Style Dictionary, generated-output tests, AndroidX-parser tests, and architecture guards.
- `pnpm --filter @m3/tokens audit:androidx` performs the pinned read-only AndroidX audit.
- `pnpm --filter @m3/tokens exec node scripts/audit-material-web-declaration-module-coverage.mjs --require-complete` proves that strict declaration audits cover the entire reconciled Material Web module set.
- `pnpm --filter @m3/tokens exec node scripts/audit-drift-registry.mjs --require-complete` validates and summarizes all documented cross-source drift.
- `pnpm --filter @m3/tokens exec node scripts/audit-figma-reference.mjs --require-complete` validates the pinned, read-only Figma reference evidence without contacting Figma.

See `/.agents/skills/style-dictionary/SKILL.md` and `/docs/architecture/README.md` before changing the token pipeline.
