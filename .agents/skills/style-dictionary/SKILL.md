---
name: style-dictionary
description: Use when editing @m3-ui/tokens canonical DTCG files, Style Dictionary configuration, generated token output, token ownership, filters, transforms, formats, audits, or token package structure.
---

# Style Dictionary

This skill defines how this repository uses Style Dictionary. It combines verified Style Dictionary v5 behavior with repository-specific architecture rules.

Validated against Style Dictionary **5.5.2**. Re-check the official docs and changelog before changing the pinned version or introducing a DTCG type/feature not already covered by generated-output tests.

## Non-negotiable repository invariant

The token flow is one-way:

```text
canonical DTCG in packages/tokens/tokens/**/*.json
                    │
                    ▼
             Style Dictionary
                    │
                    ▼
       dist/generated/tokens.js
       dist/generated/tokens.d.ts
                    │
                    ▼
              @m3/tokens
                    │
                    ▼
               @m3/ui
```

AndroidX Compose, Material 3 Figma, Material Web and other upstreams are **read-only audit references**. They never generate or rewrite canonical DTCG or runtime package files.

`@m3/tokens` has **no handwritten runtime `src/` layer**. The package root is the generated Style Dictionary API. Do not recreate compatibility facades, component subpaths, a `./generated` alias, or a second TypeScript build.

The future publish scope is `@m3-ui/tokens`; the workspace keeps `@m3/tokens` until the repository-wide namespace migration is performed atomically.

## Style Dictionary mental model

Style Dictionary is configuration-driven. Its relevant lifecycle is:

1. parse config;
2. find `source` / `include` files;
3. parse token files;
4. deep-merge them into one dictionary;
5. run preprocessors;
6. run platform transforms;
7. resolve references;
8. filter + format output files;
9. run actions.

Folder boundaries disappear after deep merge. Cross-file aliases work because reference resolution operates on the merged dictionary.

## Official behavior vs repository convention

Style Dictionary does **not** prescribe a canonical folder taxonomy. It accepts files matched by configuration and deep-merges them.

Always distinguish:

- **Style Dictionary behavior**: upstream functionality documented by Style Dictionary;
- **Repository rule**: architecture deliberately chosen for this repository.

Never describe `core/` / `component/` or other repository conventions as requirements of Style Dictionary itself.

## Repository folder structure

Current package shape:

```text
packages/tokens/
├── tokens/                         # only canonical immutable token source
│   ├── core/
│   │   ├── state.json
│   │   ├── elevation.json
│   │   ├── shape.json
│   │   ├── typography.json
│   │   ├── motion.json
│   │   └── ripple.json
│   └── component/
│       ├── button/
│       ├── card.json
│       ├── checkbox.json
│       ├── chip/
│       ├── radio-button.json
│       ├── switch.json
│       └── text-field/
├── scripts/                        # validation + read-only upstream audits
├── style-dictionary.config.mjs
├── dist/                           # generated/disposable build output
│   └── generated/
│       ├── tokens.js
│       └── tokens.d.ts
├── package.json
└── README.md
```

Repository rules:

- `tokens/**/*.json` is the only canonical token source.
- `core/` owns reusable semantic values.
- `component/` owns component-specific values and aliases.
- Large component families may use subfolders; small families may use one file.
- Split source files by semantic ownership, never by target platform.
- Never create `tokens/web`, `tokens/react`, `tokens/android`, `tokens/compose`, or upstream snapshot trees.
- A token path has exactly one canonical definition. Never depend on deep-merge overwrite order.
- `dist/**` is disposable generated output. Never hand-edit it or treat it as source.
- **Do not create `packages/tokens/src/`.** Runtime projections/types belong beside their consumers in `@m3/ui`; the token package itself publishes generated values and declarations only.

Token path changes rename generated symbols. Once consumers use those exports, treat path renames as public-API changes.

## Deciding what is a token

Do not tokenise every numeric literal, and do not leave actual design values in UI code.

Use this decision order:

1. **Immutable Material value with stable semantic identity** → canonical DTCG.
2. **Same semantic value reused by multiple components** → canonical `core` token; components alias it.
3. **Immutable component-specific design value** → canonical `component` token.
4. **Theme-dependent Material color role** → canonical component string such as `var(--primary)`; ThemeProvider supplies the runtime role value.
5. **Value derived arithmetically from canonical tokens at runtime** → derive it in `@m3/ui`; do not store the derived result as another token unless it has independent semantic identity.
6. **Web-only visual contract deliberately owned by this library** → canonical component token if it is a stable design choice users should receive consistently.
7. **Pure platform mechanics/accessibility fallback/algorithm scaffolding** → keep local to UI code and document why it is not a Material token. Examples include forced-colors system-color outlines, percentages used to center transforms, array indices, counters, and transient animation state.

Never alias values merely because their numbers happen to match. Aliases express shared semantic identity, not numeric deduplication.

If an upstream source does not own a web-only token, do not invent an AndroidX/Figma audit mapping for it. Cover that value with consumer/parity tests instead.

## Canonical DTCG format

Use plain DTCG `$type` / `$value` syntax.

```json
{
  "shape": {
    "small": {
      "$type": "dimension",
      "$value": { "value": 8, "unit": "px" }
    }
  }
}
```

Rules:

- use `$value`, never legacy `value`;
- use `$type` on a token or inherit it only from an unambiguous group;
- use native DTCG primitive types supported by the pinned Style Dictionary version;
- dimensions use explicit DTCG objects such as `{ "value": 8, "unit": "px" }`;
- never encode dimensions as bare numbers;
- aliases use references such as `{shape.small}` and may cross files;
- upstream revision/provenance belongs in audit code, not canonical token JSON;
- do not add project-specific `$extensions` unless a concrete cross-tool requirement is separately reviewed.

### Dynamic Material colors

ThemeProvider owns actual runtime Material colors. Canonical component color tokens are ordinary DTCG strings containing the runtime CSS expression:

```json
{
  "containerColor": {
    "$type": "string",
    "$value": "var(--primary)"
  }
}
```

Do not replace these with static hex placeholders and do not mark them as DTCG `color` values. `var(--primary)` is a runtime expression, not static color data.

The generated expression must flow through unchanged:

```text
DTCG var(--primary)
  -> Style Dictionary
  -> @m3/tokens
  -> UI projection/defaults
  -> CSS
```

UI code must not decode it into `primary`, camel-case it, or reconstruct `var(--primary)` later. Architecture tests deliberately forbid the old `colorRole` / `roleVariable` pattern.

## DTCG compatibility

Style Dictionary has first-class DTCG support and normally auto-detects DTCG input. Do not set `usesDtcg` unless a demonstrated auto-detection problem exists.

Style Dictionary support for the newest DTCG specification evolves over time. Before adding a new composite/type, verify support against the exact pinned version and add generated-output tests for the serialized value and declaration type.

## `source`, `include`, and inline `tokens`

### Style Dictionary behavior

- `source` matches token files that are parsed and deep-merged.
- `include` acts as a base collection that `source` can override.
- config may also provide inline `tokens`.

### Repository rule

Use only canonical source:

```js
source: ['tokens/**/*.json']
```

Do not use `include` for AndroidX, Figma, Material Web, or another upstream. Do not place canonical values inline in config. Upstreams are audit oracles only.

## Configuration

Use the package-local ESM config:

```text
packages/tokens/style-dictionary.config.mjs
```

Use official enums for built-in names and strict logging:

```js
import {
  formats,
  logBrokenReferenceLevels,
  logWarningLevels,
  transformGroups,
} from 'style-dictionary/enums';

export default {
  source: ['tokens/**/*.json'],

  log: {
    warnings: logWarningLevels.error,
    errors: {
      brokenReferences: logBrokenReferenceLevels.throw,
    },
  },

  platforms: {
    js: {
      transformGroup: transformGroups.js,
      buildPath: 'dist/generated/',
      options: {
        showFileHeader: false,
      },
      files: [
        {
          destination: 'tokens.js',
          format: formats.javascriptEs6,
        },
        {
          destination: 'tokens.d.ts',
          format: formats.typescriptEs6Declarations,
          options: {
            outputStringLiterals: true,
          },
        },
      ],
    },
  },
};
```

Why:

- canonical DTCG is the only source;
- warnings/collisions fail CI instead of being silently tolerated;
- broken references throw;
- built-in `js` transforms and formats are the actual build engine;
- JS and declarations share one naming pipeline;
- literal string declarations preserve values such as `var(--primary)`;
- generated headers have no timestamp, keeping output deterministic.

The build script invokes this config explicitly:

```json
{
  "tokens:build": "style-dictionary build --config style-dictionary.config.mjs"
}
```

## Transforms

A transform group is ordered behavior, not a neutral label. The built-in JS group applies naming/value transforms before formatting.

Repository rules:

- use built-ins before registering custom transforms;
- do not assume `transformGroup: js` leaves every value untouched;
- keep runtime CSS color references typed as strings so color transforms cannot reinterpret them;
- if transform ordering becomes important, define and review an explicit group instead of relying on accidental append order;
- never write a transform merely to recreate an ergonomic handwritten token facade.

A consumer that needs numeric `px`/`ms` values for arithmetic/timers may parse the generated string in narrow `@m3/ui` helpers. That conversion is a runtime boundary, not another token table.

## Platforms, files, filters, formats

A Style Dictionary platform is an output target, not a canonical token layer.

Current repository rule: there is only the typed JS platform. Do **not** add a generic `css/variables` platform: ThemeProvider owns runtime color variables, while non-color immutable values stay generated JS values.

Add another platform only for a real consumer with different output semantics and explicit review.

Use built-in formats first:

- `formats.javascriptEs6` -> `tokens.js`;
- `formats.typescriptEs6Declarations` -> `tokens.d.ts`.

If output later needs to be split per component, keep one canonical graph and use multiple `files` plus filters. Do not create platform-specific canonical source trees or independent dictionaries by default.

Style Dictionary resolves aliases before formatting. The literal `var(--primary)` value is not a Style Dictionary alias and does not need `outputReferences`.

Do not enable `outputReferences` or `expand` mechanically. Verify exact support and consumer need before using either.

## Custom hooks

Prefer zero custom parsers, preprocessors, transforms, formats, or actions.

Use an extension hook only at the lifecycle stage that actually owns the requirement. Never write a custom generator simply to reshape data that should be modeled in canonical DTCG or emitted by a built-in format.

## Generated package API

`@m3/tokens` exposes only the generated root API:

```text
@ m3/tokens package root
  -> dist/generated/tokens.js
  -> dist/generated/tokens.d.ts
```

(Whitespace above is illustrative; the actual import is `@m3/tokens`.)

Rules:

- no handwritten runtime `src/` layer;
- no `./generated` alias;
- no component/core convenience subpaths;
- no separate token-package `tsc` build;
- no handwritten type/value facades;
- never copy generated values into TypeScript modules;
- ergonomic projection objects/types needed by a component live beside that component in `@m3/ui` and derive from the package-root generated exports.

Generated files are disposable build artifacts, but generated export names become API once consumed. Build JS and declarations from the same naming pipeline and test the real generated artifacts.

## Upstream audit

Audit is intentionally asymmetric:

```text
AndroidX / Figma / Material Web
          │
          ▼
  normalize in memory
          │
          ▼
 compare against canonical DTCG
```

Never reverse this arrow.

Audit code may contain pinned revisions and mapping tables. It must not contain a renderer/write path into `tokens/`.

For dynamic colors compare semantic role identity, e.g. AndroidX `Primary` ↔ canonical `var(--primary)`, rather than static hex values.

Only audit a web-only/library-owned token when an upstream reference actually owns the same semantic value. Otherwise verify it in consumer/parity tests and document the adaptation.

## Validation and tests

Every token/config change should pass:

1. **Canonical validation**
   - parse all `tokens/**/*.json`;
   - merge one graph;
   - reject duplicate paths;
   - reject unsupported/legacy fields;
   - reject missing aliases and cycles.

2. **Real Style Dictionary build**
   - run pinned Style Dictionary;
   - import actual generated JS;
   - assert representative dimensions, numbers, aliases, runtime CSS strings and symbol names;
   - inspect generated `.d.ts` declarations.

3. **Architecture guards**
   - token package has no handwritten `src/`;
   - package exports only `.`;
   - UI imports only package root;
   - no upstream source enters Style Dictionary;
   - no generic CSS platform appears;
   - runtime color expressions are not decoded/re-encoded.

4. **Read-only upstream audit**
   - compare canonical mappings against pinned upstream sources;
   - zero write path.

5. **Consumer verification**
   - unit tests;
   - typecheck;
   - build;
   - visual regression when rendering can change.

## Determinism

- pin Style Dictionary and the lockfile;
- fail warnings/collisions;
- disable generated timestamps;
- never require upstream network access during package build;
- keep upstream network access in explicit audit commands only;
- never hand-edit or time-vary generated output.

## Forbidden regressions

Do not:

- recreate `packages/tokens/src/`;
- recreate token compatibility facades/subpath aliases;
- recreate `scripts/compose-sync` or `src/generated/androidx`;
- treat AndroidX/Figma/Material Web as Style Dictionary `source` or `include`;
- generate canonical DTCG from upstream;
- organize canonical tokens by target platform;
- maintain one giant canonical JSON merely because Style Dictionary can merge it;
- rely on duplicate source paths being overwritten;
- use static hex placeholders for ThemeProvider-owned color roles;
- decode `var(--role)` into a semantic name and reconstruct it later;
- add generic CSS-variable output for immutable non-color tokens;
- handwrite a TypeScript generator when built-in formats work;
- hand-edit `dist/generated`;
- copy generated values back into UI or token-package constant tables;
- alias unrelated tokens only because their numeric values match;
- tokenise pure CSS/DOM mechanics as if they were Material design tokens.

If a future requirement appears to need one of these, treat it as an architecture change requiring explicit review rather than silently reviving an old direction.

## Change checklist

When changing tokens/config:

- [ ] value has stable semantic identity and belongs in the token graph;
- [ ] canonical file is under `tokens/core` or `tokens/component`;
- [ ] path is defined once;
- [ ] DTCG `$type` / `$value` is used;
- [ ] dimensions have explicit units;
- [ ] reusable semantic value aliases a core token instead of being copied;
- [ ] runtime Material color is a direct `var(--role)` string;
- [ ] no upstream reference entered `source` / `include`;
- [ ] no compatibility facade or token-package `src/` was added;
- [ ] no unnecessary custom hook/platform was added;
- [ ] real generated-output tests pass;
- [ ] JS and declaration names still match;
- [ ] upstream audit passes for mapped Material-owned values;
- [ ] consumer unit/type/build tests pass;
- [ ] visual regression passes when rendering is affected.

## Official references

Reviewed 2026-08-22:

- https://styledictionary.com/info/package_structure/
- https://styledictionary.com/info/architecture/
- https://styledictionary.com/info/dtcg/
- https://styledictionary.com/reference/config/
- https://styledictionary.com/reference/logging/
- https://styledictionary.com/reference/enums/
- https://styledictionary.com/reference/hooks/transforms/predefined/
- https://styledictionary.com/reference/hooks/transform-groups/
- https://styledictionary.com/reference/hooks/transform-groups/predefined/
- https://styledictionary.com/reference/hooks/formats/
- https://styledictionary.com/reference/hooks/formats/predefined/
- https://styledictionary.com/examples/basic/
- https://styledictionary.com/examples/splitting-output-files/
- https://github.com/style-dictionary/style-dictionary/blob/main/CHANGELOG.md
