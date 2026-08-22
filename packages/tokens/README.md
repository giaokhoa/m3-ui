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

There is no static fallback color and no `$extensions` metadata. Non-color values use natural DTCG types where the pinned Style Dictionary version supports the required representation; they are generated as static JS/TypeScript values and are not root CSS variables.

## Style Dictionary

Style Dictionary 5.5.2 is the build engine. `style-dictionary.config.mjs` uses the built-in JS transform group plus `javascript/es6` and `typescript/es6-declarations`; no handwritten token generator or formatter exists. Warnings/collisions fail and broken references throw. Generated headers are disabled for deterministic output.

Generated artifacts live at `dist/generated/tokens.js` and `dist/generated/tokens.d.ts`. The package root points directly to these artifacts. `./generated` is currently an equivalent explicit alias used by internal consumers.

`src/*.ts` subpath modules are compatibility/projection facades only. They may reshape generated values or convert CSS lengths/durations to numbers for existing arithmetic APIs, but they must import generated tokens and must never own an immutable design value. The architecture test enforces this boundary.

## Validation and audit

- `pnpm --filter @m3/tokens validate` merges all canonical files, rejects duplicate paths, and validates DTCG structure, aliases, cycles, and supported primitive types.
- `pnpm --filter @m3/tokens test` runs canonical validation, the real Style Dictionary build, generated-output tests, AndroidX-parser tests, and package architecture checks.
- `pnpm --filter @m3/tokens audit:androidx` fetches the exact pinned AndroidX sources and compares mapped values in memory. It has no write/render path.

Audits are asymmetric: matches pass; mismatches and missing mappings/references fail review. Network access belongs to explicit audit commands, never the package build.

See `/.agents/skills/style-dictionary/SKILL.md` for the repository's Style Dictionary patterns and rules.
