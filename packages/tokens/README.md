# Tokens

Target publish scope: `@m3-ui/tokens`. The workspace keeps its current package scope until the repository-wide namespace migration is done in one atomic change.

## Source of truth

`tokens/**/*.json` is the only authoritative token source. The files use plain DTCG `$type` / `$value` tokens and intentionally contain no project-specific ownership, provenance, or audit metadata.

AndroidX Compose, the Material 3 Figma Design Kit, Material Web, and other upstreams are read-only references. Audit code owns all source mapping and revision information; upstream data must never generate or rewrite canonical token files.

```text
AndroidX Compose ─┐
Figma M3 Kit ─────┼── normalize ──> read-only semantic diff
Material Web ─────┘

                         tokens/**/*.json
                         CANONICAL / REVIEWED
                                │
                                ▼
                         Style Dictionary
                                │
                       ┌────────┴────────┐
                       ▼                 ▼
                   tokens.js        tokens.d.ts
```

## Dynamic color

`ThemeProvider` remains the owner of actual theme colors. It computes the scheme from `sourceColor`, mode, and contrast, then assigns role variables such as `--primary`, `--on-primary`, and `--surface` on the provider root.

Canonical component tokens refer to those runtime roles as ordinary DTCG strings:

```json
{
  "containerColor": {
    "$type": "string",
    "$value": "var(--primary)"
  }
}
```

There is no static fallback color in the token package and no extra `$extensions` metadata. Nested `ThemeProvider`s continue to work through normal CSS custom-property inheritance.

All non-color values use their natural DTCG types, for example `dimension` and `number`. They are generated as JavaScript/TypeScript constants and do not become CSS custom properties.

## Style Dictionary

Style Dictionary is the build engine, not a sidecar formatter. `style-dictionary.config.json` uses its built-in `js` transform group, `javascript/es6`, and `typescript/es6-declarations` formats. No custom TypeScript generator is used.

Generated files live under `dist/generated/` and are available from the temporary `./generated` package export while handwritten token modules are migrated. Once consumers are moved, duplicate handwritten token literals can be deleted.

## Validation and audit

- `pnpm --filter @m3/tokens validate` validates canonical DTCG structure, aliases, cycles, and supported primitive types.
- `pnpm --filter @m3/tokens test` validates the source, runs Style Dictionary, and tests both DTCG behavior and generated JS/TypeScript output.
- `pnpm --filter @m3/tokens audit:androidx` compares mapped canonical values with the pinned AndroidX source without writing canonical files.

Audits are asymmetric: matching values pass; mismatches, missing canonical mappings, and missing upstream references fail review. Audit code must remain read-only.
