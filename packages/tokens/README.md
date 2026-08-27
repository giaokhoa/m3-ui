# Tokens

Target publish scope: `@m3-ui/tokens`. The workspace keeps `@m3-ui/tokens` until the repository-wide namespace migration is done atomically.

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
- CI scans every `*-drift.json` manifest, normalizes both `records` and `drift` schemas (including nested foundation drift), validates referenced canonical paths, detects duplicate drift IDs, and rejects stale pinned implementation-reference revisions/versions, including Material Components Android and Flutter evidence.
- CI also validates pinned Figma and corroborating reference evidence against `scripts/sources.mjs`; it never needs Figma credentials and never consumes reference data as a token build input.

The result is one Style Dictionary source of truth with independently measurable source drift, rather than several upstream token corpora being merged at build time.

## Dynamic color

`ThemeProvider` owns actual runtime Material colors. Canonical component colors are ordinary DTCG strings containing CSS role references such as `var(--primary)`. There is no static fallback color and no `$extensions` metadata. Non-color design values are generated as static JS/TypeScript values and are not generic root CSS variables.

The checked-in baseline light/dark scheme is an immutable canonical reference graph, separate from runtime dynamic-color resolution. Cross-source audits may resolve those baseline aliases to static hex values for comparison, but Figma/Web/Android snapshots remain outside `tokens/` and cannot become runtime inputs.

A runtime theme override such as the global font family may still use CSS inheritance/custom properties; that is runtime theming, not a second token transport layer.

## Style Dictionary API

Style Dictionary 5.5.2 is the sole build engine. `style-dictionary.config.mjs` reads only `tokens/**/*.json` and emits `dist/generated/tokens.js` plus `tokens.d.ts` using built-in formats.

The package root is the **only runtime API**. There is no handwritten `src/` layer, no `./generated` alias, and no component/elevation convenience subpaths. UI code imports `@m3-ui/tokens` directly. Ergonomic projections needed for arithmetic or component behavior live beside their consumers in `@m3-ui/ui` and may only derive from generated values.

This boundary is intentional: `@m3-ui/tokens` publishes the canonical generated vocabulary; it does not maintain a second object-shaped token API.

## Upstream audit

AndroidX revision and file mappings live under `scripts/androidx/` and `audit-androidx.mjs`. Material Web inventory/declaration auditors use the pinned generated Sass corpus. Shared source pins live in `scripts/sources.mjs`, including corroborating Material Components Android and Flutter references. The audits fetch or snapshot pinned source evidence, normalize semantic values, and compare them against canonical tokens. They have no renderer and no write path into `tokens/`.

Runtime colors are audited first by semantic role identity (`Primary` ↔ `var(--primary)`), not by replacing dynamic roles with static hex values. The separate baseline-scheme audit may compare static Light/Dark reference values when an upstream source owns that same baseline semantic role. Web-only/runtime adaptations are audited only when an upstream token actually owns the same semantic value; defaults/layout behavior belongs in independent parity tests.

Cross-source exceptions live under `audit/*-drift.json`. `scripts/audit-drift-registry.mjs` treats those files as an audit registry rather than a build input. It reports drift by classification and source manifest while failing malformed records, stale pinned Compose/Material Web/Material Components Android/Flutter reference metadata, duplicate IDs, or `canonicalPath` references that no longer exist in the Style Dictionary graph.

Figma remains a design reference rather than a build source. `scripts/sources.mjs` pins the Material 3 Design Kit library/version metadata. `audit/figma-reference-evidence.json` records the complete eight-value published Shape corner set, representative Typescale values and text/key-color styles, plus a complete **15/15 baseline typography tracking sweep**. `audit/figma-typography-metrics-evidence.json` separately records the complete 15-role Typescale sweep for **size, line height, baseline weight, and emphasized weight (60 resolved metric values)**. Both snapshots were read from the exact pinned published library through Figma design-system search and `variables.importVariableByKeyAsync`; the temporary Figma file used only as connector context is deliberately not persisted.

`scripts/audit-figma-reference.mjs` validates the Shape/Typescale evidence offline in CI, including the source pin, key format/uniqueness, Shape/Typescale values, all 15 tracking roles, all 15 typography metric roles, all 60 metric values, and representative styles. `figma-typography-metrics.test.mjs` additionally cross-checks Figma dimensions and weight classes against the canonical DTCG graph, including the actual baseline/emphasized `fontWeight` aliases. The live sweep shows size, line height, and baseline weight agreeing across Figma v1.25, Compose, Material Web 34.0.21, and canonical. Figma emphasized weights agree with canonical and Material Web latest; Compose's emphasized block remains explicitly generated-source-lag/TODO evidence rather than a reason to rewrite canonical tokens.

Figma color evidence is complete for the baseline scheme. `audit/figma-color-scheme-evidence.json` pins the published `M3` collection, inventories all **32 collection modes**, and records **49/49 semantic scheme roles × Light/Dark = 98 resolved color values** with 49 unique published variable keys. `figma-color-scheme.test.mjs` proves that this vocabulary exactly equals the canonical runtime role vocabulary, that the canonical baseline Dark scheme matches Figma **48/48**, and that baseline Light matches **44/48** with exactly four explicit on-container divergences. `Shadow` is the deliberate 49th runtime/Figma role outside the 48-role baseline-scheme file.

The four Light divergences are not treated as a simple stale-Compose bug. `audit/color-light-on-container-reference-evidence.json` records that Material Web generated 34.0.21 uses the generic tone-30 model for `onPrimaryContainer`, `onSecondaryContainer`, `onTertiaryContainer`, and `onErrorContainer`, while Material Components Android generated 34.0.0 explicitly says those generic values are overridden by Android config to tone 10; Compose `ColorLightTokens` v0_210 and the canonical baseline follow that effective Android model. `audit/figma-color-scheme-drift.json` preserves this as an `implementation-override` pending normative review. It separately records Figma's exact-value drift from Web generic for Primary (`#4F378A` vs `#4F378B`), Secondary (`#4A4459` vs `#4A4458`), and Error (`#852221` vs `#8C1D18`); Tertiary agrees exactly at `#633B48`. Canonical colors remain unchanged until normative material.io evidence resolves the platform/model choice.

The four explicit contrast modes are audited independently rather than added to the canonical graph. `audit/figma-color-contrast-evidence.json` records the same **49 published role keys × Light/Dark High/Medium Contrast = 196 Figma values**. `audit/material-web-color-contrast-evidence.json` normalizes the four pinned Material Web 34.0.21 generated modules to their role-to-palette aliases. `figma-color-contrast.test.mjs` resolves those Web aliases against the pinned baseline palette and proves that role identity remains 49/49 while exact values diverge systematically: **21/49 Light High**, **19/49 Light Medium**, **22/49 Dark High**, and **13/49 Dark Medium** match exactly. Because mismatches span accents, fixed roles, surfaces, outlines, inverses, and on-colors, `color-contrast-generation-model` classifies this once as `source-model-drift` rather than manufacturing dozens of independent token errors. The canonical baseline intentionally remains Light/Dark only pending normative guidance on which contrast-generation model, if any, belongs in the public token API.

For baseline tracking, the evidence is broader than Figma/Web alone. `audit/typography-tracking-reference-evidence.json` pins the generated `md.sys.typescale` output from Material Components Android 34.0.0 and Flutter's `_M3Typography`, whose source notes that it is generated from the Material Design token database. `typography-tracking-reference-evidence.test.mjs` proves that Material Components Android normalizes to the same 15 tracking values and that **Figma v1.25, Material Web 34.0.21, Material Components Android 34.0.0, and Flutter agree 15/15**. Compose/canonical differ only at Display Large, Title Medium, and Body Medium. Those three values remain in `foundation-drift.json` with `preferredReference: normative-spec-review`: material.io is still the normative textual specification, so implementation consensus strengthens the evidence but does not silently rewrite canonical DTCG. The central drift registry also validates the Android/Flutter corroborating pins so this evidence cannot silently become stale.

Motion is audited as a foundation reference rather than a second runtime source. `audit/motion-reference-evidence.json` pins the generated Compose `MotionTokens`, `StandardMotionTokens`, `ExpressiveMotionTokens`, and motion scheme keys plus the corresponding Material Web files. `motion-reference-evidence.test.mjs` proves that Compose exactly corroborates canonical **16/16 durations, 10/10 cubic-bezier easings, 6/6 standard spring families, and 6/6 expressive spring families**. Material Web generated 34.0.21 independently corroborates the same 16 durations, 10 easings, and 6 standard spring families, while expressive springs remain absent there; its v0.192 generated adapter still exposes only duration/easing. A read-only Figma Material 3 Design Kit v1.25 published search returned **0 variables and 0 styles** for each of `spring`, `motion`, `easing`, and `duration`, so the existing `not-observed` Figma drift remains explicit rather than inventing motion values. No external motion evidence is a Style Dictionary input and no canonical mutation is implied.

Elevation is audited separately at the semantic-level and rendered-shadow layers. `audit/elevation-reference-evidence.json` pins the Compose, Material Web, and Figma references outside `tokens/**/*.json`. Canonical, Compose, and Material Web generated values agree **6/6** on semantic elevation levels `0, 1, 3, 6, 8, 12`, while the Material Web public wrapper deliberately remaps those values to ordinal API levels `0..5`. Figma v1.25 publishes **10 Elevation effect styles** (`Light/1..5` and `Dark/1..5`) and no elevation variables. After normalizing effect order by shadow opacity, all 10 Figma styles map exactly to the same five current Material Web renderer recipes: two DROP_SHADOW layers using **0.30 key + 0.15 ambient** opacity with identical geometry per level. Canonical shadow tokens use a different **three-layer 0.20/0.14/0.12** recipe, so `elevation-figma-shadow-recipe` is preserved as `cross-source-value-drift` with `preferredReference: normative-spec-review` rather than being mislabeled as a Figma-only platform adaptation. The exact material.io elevation page still does not yield machine-readable textual shadow-recipe evidence, so canonical DTCG remains unchanged.

## Forbidden regressions

Do **not** reintroduce: a handwritten token runtime `src/` layer; token-package compatibility facades or subpath aliases; `scripts/compose-sync`; `src/generated/androidx`; upstream files as Style Dictionary `source`/`include`; generators that write canonical DTCG; custom TypeScript generators duplicating Style Dictionary built-ins; static hex placeholders for ThemeProvider-owned roles; generic CSS-variable output for non-color immutable tokens; or handwritten design constants where a canonical token exists.

If a future requirement appears to need one of these, treat it as an architecture change requiring explicit review rather than silently reviving the old direction.

## Validation and audit commands

- `pnpm --filter @m3-ui/tokens validate` validates the canonical graph.
- `pnpm --filter @m3-ui/tokens test` cleans generated output, runs Style Dictionary, generated-output tests, AndroidX-parser tests, architecture guards, complete Figma typography/color parity tests, and the pinned first-party typography tracking consensus guard.
- `pnpm --filter @m3-ui/tokens audit:androidx` performs the pinned read-only AndroidX audit.
- `pnpm --filter @m3-ui/tokens exec node scripts/audit-material-web-declaration-module-coverage.mjs --require-complete` proves that strict declaration audits cover the entire reconciled Material Web module set.
- `pnpm --filter @m3-ui/tokens exec node scripts/audit-drift-registry.mjs --require-complete` validates and summarizes all documented cross-source drift and the pinned corroborating implementation references used by drift evidence.
- `pnpm --filter @m3-ui/tokens exec node scripts/audit-figma-reference.mjs --require-complete` validates the pinned, read-only Figma Shape/Typescale evidence without contacting Figma.
- `pnpm --filter @m3-ui/tokens exec node --test scripts/figma-color-scheme.test.mjs` validates the complete pinned Figma Light/Dark color sweep and its documented cross-source divergence.
- `pnpm --filter @m3-ui/tokens exec node --test scripts/figma-color-contrast.test.mjs` validates all four Figma contrast modes against the pinned Material Web contrast models while keeping them audit-only.
- `pnpm --filter @m3-ui/tokens exec node --test scripts/motion-reference-evidence.test.mjs` validates pinned Compose/Web/Figma motion evidence while keeping every external source audit-only.
- `pnpm --filter @m3-ui/tokens exec node --test scripts/elevation-reference-evidence.test.mjs` validates semantic elevation parity, the ten Figma effect styles, Material Web renderer parity, and the unresolved canonical shadow-recipe drift without making any external reference a build input.

See `/.agents/skills/style-dictionary/SKILL.md` and `/docs/architecture/README.md` before changing the token pipeline.
