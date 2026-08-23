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

AndroidX Compose, the Material 3 Figma Design Kit, Material Web, Material Components Android, Flutter Material, and other upstreams are read-only references. Audit code owns source revision/mapping information; upstream data never generates or rewrites canonical or runtime token files.

This is intentionally a **single-source build / multi-reference audit** architecture:

- Style Dictionary reads only `tokens/**/*.json`.
- Reference metadata and snapshots live outside `tokens/` and therefore cannot enter generated output.
- Cross-source disagreements are preserved as explicit drift records instead of being merged into a second token graph.
- CI verifies that all reconciled Material Web modules are covered by strict declaration audits and that the strict-audit module union still equals the reconciled module set.
- CI scans every `*-drift.json` manifest, normalizes both `records` and `drift` schemas (including nested foundation drift), validates referenced canonical paths, detects duplicate drift IDs, and rejects stale pinned implementation-reference revisions/versions, including the corroborating Material Components Android and Flutter typography evidence.
- CI also validates pinned Figma and typography-reference evidence against `scripts/sources.mjs`; it never needs Figma credentials and never consumes reference data as a token build input.

The result is one Style Dictionary source of truth with independently measurable source drift, rather than several upstream token corpora being merged at build time.

## Dynamic color

`ThemeProvider` owns actual runtime Material colors. Canonical component colors are ordinary DTCG strings containing CSS role references such as `var(--primary)`. There is no static fallback color and no `$extensions` metadata. Non-color design values are generated as static JS/TypeScript values and are not generic root CSS variables.

A runtime theme override such as the global font family may still use CSS inheritance/custom properties; that is runtime theming, not a second token transport layer.

## Style Dictionary API

Style Dictionary 5.5.2 is the sole build engine. `style-dictionary.config.mjs` reads only `tokens/**/*.json` and emits `dist/generated/tokens.js` plus `tokens.d.ts` using built-in formats.

The package root is the **only runtime API**. There is no handwritten `src/` layer, no `./generated` alias, and no component/elevation convenience subpaths. UI code imports `@m3/tokens` directly. Ergonomic projections needed for arithmetic or component behavior live beside their consumers in `@m3/ui` and may only derive from generated values.

This boundary is intentional: `@m3/tokens` publishes the canonical generated vocabulary; it does not maintain a second object-shaped token API.

## Upstream audit

AndroidX revision and file mappings live under `scripts/androidx/` and `audit-androidx.mjs`. Material Web inventory/declaration auditors use the pinned generated Sass corpus. Shared source pins live in `scripts/sources.mjs`, including corroborating Material Components Android and Flutter typography references. The audits fetch or snapshot pinned source evidence, normalize semantic values, and compare them against canonical tokens. They have no renderer and no write path into `tokens/`.

Colors are audited by semantic role identity (`Primary` ↔ `var(--primary)`), not by static hex values. Web-only/runtime adaptations are audited only when an upstream token actually owns the same semantic value; Defaults/layout behavior belongs in independent parity tests.

Cross-source exceptions live under `audit/*-drift.json`. `scripts/audit-drift-registry.mjs` treats those files as an audit registry rather than a build input. It reports drift by classification and source manifest while failing malformed records, stale pinned Compose/Material Web/Material Components Android/Flutter reference metadata, duplicate IDs, or `canonicalPath` references that no longer exist in the Style Dictionary graph.

Figma remains a design reference rather than a build source. `scripts/sources.mjs` pins the Material 3 Design Kit library/version metadata. `audit/figma-reference-evidence.json` records the complete eight-value published Shape corner set, representative Typescale values and text/key-color styles, plus a complete **15/15 baseline typography tracking sweep**. `audit/figma-typography-metrics-evidence.json` separately records the complete 15-role Typescale sweep for **size, line height, baseline weight, and emphasized weight (60 resolved metric values)**. Both snapshots were read from the exact pinned published library through Figma design-system search and `variables.importVariableByKeyAsync`; the temporary Figma file used only as connector context is deliberately not persisted.

`scripts/audit-figma-reference.mjs` validates both Figma evidence files offline in CI, including the source pin, key format/uniqueness, Shape/Typescale values, all 15 tracking roles, all 15 typography metric roles, all 60 metric values, and representative styles. `figma-typography-metrics.test.mjs` additionally cross-checks Figma dimensions and weight classes against the canonical DTCG graph, including the actual baseline/emphasized `fontWeight` aliases. The live sweep shows size, line height, and baseline weight agreeing across Figma v1.25, Compose, Material Web 34.0.21, and canonical. Figma emphasized weights agree with canonical and Material Web latest; Compose's emphasized block remains explicitly generated-source-lag/TODO evidence rather than a reason to rewrite canonical tokens.

For baseline tracking, the evidence is broader than Figma/Web alone. `audit/typography-tracking-reference-evidence.json` pins the generated `md.sys.typescale` output from Material Components Android 34.0.0 and Flutter's `_M3Typography`, whose source notes that it is generated from the Material Design token database. `typography-tracking-reference-evidence.test.mjs` proves that Material Components Android normalizes to the same 15 tracking values and that **Figma v1.25, Material Web 34.0.21, Material Components Android 34.0.0, and Flutter agree 15/15**. Compose/canonical differ only at Display Large, Title Medium, and Body Medium. Those three values remain in `foundation-drift.json` with `preferredReference: normative-spec-review`: material.io is still the normative textual specification, so implementation consensus strengthens the evidence but does not silently rewrite canonical DTCG. The central drift registry also validates the Android/Flutter corroborating pins so this evidence cannot silently become stale.

## Forbidden regressions

Do **not** reintroduce: a handwritten token runtime `src/` layer; token-package compatibility facades or subpath aliases; `scripts/compose-sync`; `src/generated/androidx`; upstream files as Style Dictionary `source`/`include`; generators that write canonical DTCG; custom TypeScript generators duplicating Style Dictionary built-ins; static hex placeholders for ThemeProvider-owned roles; generic CSS-variable output for non-color immutable tokens; or handwritten design constants where a canonical token exists.

If a future requirement appears to need one of these, treat it as an architecture change requiring explicit review rather than silently reviving the old direction.

## Validation and audit commands

- `pnpm --filter @m3/tokens validate` validates the canonical graph.
- `pnpm --filter @m3/tokens test` cleans generated output, runs Style Dictionary, generated-output tests, AndroidX-parser tests, architecture guards, complete Figma typography-metrics parity tests, and the pinned first-party typography tracking consensus guard.
- `pnpm --filter @m3/tokens audit:androidx` performs the pinned read-only AndroidX audit.
- `pnpm --filter @m3/tokens exec node scripts/audit-material-web-declaration-module-coverage.mjs --require-complete` proves that strict declaration audits cover the entire reconciled Material Web module set.
- `pnpm --filter @m3/tokens exec node scripts/audit-drift-registry.mjs --require-complete` validates and summarizes all documented cross-source drift and the pinned corroborating implementation references used by drift evidence.
- `pnpm --filter @m3/tokens exec node scripts/audit-figma-reference.mjs --require-complete` validates both pinned, read-only Figma evidence snapshots without contacting Figma.

See `/.agents/skills/style-dictionary/SKILL.md` and `/docs/architecture/README.md` before changing the token pipeline.
