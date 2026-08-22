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

```text
AndroidX / Figma / Material Web
           │
           └── read-only normalize + diff
                         ▲
                         │
                  tokens/**/*.json
                  CANONICAL / REVIEWED
                         │
                         ▼
                  Style Dictionary
                         │
                 ┌───────┴────────┐
                 ▼                ▼
             tokens.js        tokens.d.ts
```

## Dynamic color

`ThemeProvider` owns actual runtime Material colors. Canonical component colors are ordinary DTCG strings containing the CSS role reference:

```json
{
  "containerColor": {
    "$type": "string",
    "$value": "var(--primary)"
  }
}
```

There is no static fallback color and no `$extensions` metadata. Non-color design values use natural DTCG types where the pinned Style Dictionary version supports the required representation; they are generated as static JS/TypeScript values and are not generic root CSS variables.

A runtime theme override such as the global font family may still use CSS inheritance/custom properties; that is runtime theming, not a second token transport layer.

## Style Dictionary

Style Dictionary 5.5.2 is the build engine. `style-dictionary.config.mjs` uses only `tokens/**/*.json` as source and the built-in JS transform group plus `javascript/es6` and `typescript/es6-declarations`. No handwritten token generator or formatter exists. Warnings/collisions fail and broken references throw. Generated headers are disabled for deterministic output.

Generated artifacts live at `dist/generated/tokens.js` and `dist/generated/tokens.d.ts`. The package root points directly to these artifacts. `./generated` is an equivalent explicit alias currently used by internal consumers.

`src/*.ts` subpath modules are compatibility/projection facades only. They may reshape generated values or convert CSS lengths/durations to numbers for existing arithmetic APIs, but they must import generated tokens and must never own an immutable design value. Architecture tests enforce this boundary.

## Upstream audit

AndroidX revision and file mappings live under `scripts/androidx/` and `audit-androidx.mjs`. The audit fetches pinned files, parses them in memory, normalizes semantic values, and compares them against canonical tokens. It has no renderer and no write path into `tokens/` or `src/`.

Colors are audited by semantic role identity (`Primary` ↔ `var(--primary)`), not by static hex values. Web-only/runtime adaptations are audited only when an upstream token actually owns the same semantic value; Defaults/layout behavior belongs in independent parity tests.

## Forbidden regressions

Do **not** reintroduce any of the following, even as a convenience:

- `scripts/compose-sync` or any renamed repository-wide upstream sync generator;
- `src/generated/androidx` or another checked-in AndroidX runtime snapshot;
- AndroidX/Figma/Material Web files as Style Dictionary `source` or `include` inputs;
- a generator that writes canonical DTCG from upstream data;
- a custom TypeScript generator that duplicates Style Dictionary built-ins;
- static hex placeholders for ThemeProvider-owned semantic color roles;
- a generic CSS-variable output platform for non-color immutable tokens;
- handwritten design constants in projection facades or component defaults when a canonical token exists.

If a future requirement appears to need one of these, treat it as an architecture change requiring explicit review rather than silently reviving the old direction.

## Validation and audit commands

- `pnpm --filter @m3/tokens validate` merges canonical files, rejects duplicate paths, and validates DTCG structure, aliases, cycles, and supported primitive types.
- `pnpm --filter @m3/tokens test` runs canonical validation, the real Style Dictionary build, generated-output tests, AndroidX-parser tests, and package architecture guards.
- `pnpm --filter @m3/tokens audit:androidx` fetches the exact pinned AndroidX sources and compares mapped values in memory. It has no write/render path.

Audits are asymmetric: matches pass; mismatches and missing mappings/references fail review. Network access belongs to explicit audit commands, never the package build.

See `/.agents/skills/style-dictionary/SKILL.md` and `/docs/architecture/README.md` before changing the token pipeline.
