---
name: style-dictionary
description: Use when editing @m3-ui/tokens canonical DTCG files, Style Dictionary configuration, generated token outputs, filters, transforms, formats, or token package structure.
---

# Style Dictionary

This skill defines how this repository uses Style Dictionary. It is based on the Style Dictionary v5 documentation and the pinned package version used by this repository.

Validated against Style Dictionary 5.5.2. Re-check the official docs and changelog before changing major/minor versions or adopting newly added DTCG types.

## Mental model

Style Dictionary is configuration-driven. Treat its lifecycle as:

1. parse config;
2. find `source` / `include` token files;
3. parse token files;
4. deep-merge them into one dictionary;
5. run preprocessors;
6. run platform transforms;
7. resolve token references;
8. filter + format output files;
9. run actions.

This ordering matters. Folder boundaries disappear after the deep merge. Cross-file aliases are valid because reference resolution happens against the merged dictionary.

## Official behavior vs repository convention

Style Dictionary does **not** prescribe one canonical token folder taxonomy. Its docs explicitly allow token files to live anywhere as long as config points to them, and all matched source files are deep-merged.

Therefore:

- statements under **Style Dictionary behavior** describe upstream behavior;
- statements under **Repository rule** are deliberate `m3-ui` conventions and must be followed in this repository.

Do not present repository conventions as requirements of Style Dictionary itself.

## Repository folder structure

Use this package shape:

```text
packages/tokens/
├── tokens/                         # canonical DTCG source; human-reviewed
│   ├── core/                       # reusable non-component tokens
│   │   ├── state.json
│   │   ├── elevation.json
│   │   ├── shape.json
│   │   ├── typography.json
│   │   └── motion.json
│   └── component/                  # component-specific tokens
│       ├── button/
│       │   ├── base.json
│       │   ├── variants.json
│       │   └── sizes.json
│       ├── switch.json
│       └── text-field/
│           ├── shared.json
│           ├── filled.json
│           └── outlined.json
├── style-dictionary.config.mjs     # package-local Style Dictionary config
├── scripts/                        # validation + upstream read-only audits
├── src/                            # optional handwritten API/types only
├── dist/                           # generated/publish output; disposable
│   └── generated/
│       ├── tokens.js
│       └── tokens.d.ts
├── package.json
└── README.md
```

### Repository rules for folders

- `tokens/**` is the only canonical design-token source.
- Split canonical files by semantic ownership, not by output platform.
- Never create canonical `tokens/web`, `tokens/react`, `tokens/android`, or `tokens/compose` trees. Platform adaptation belongs in Style Dictionary platforms/transforms or runtime code.
- `core/` contains values reusable across components. A component should alias a core value instead of copying it.
- `component/` contains component-specific values and aliases.
- Large component families may use a subfolder; small components may use one JSON file.
- A token path must have exactly one canonical definition across all source files. Do not rely on deep-merge overwrite order.
- `dist/**` is generated. Never hand-edit it and never make it canonical.
- `src/**` must not duplicate canonical token values. It may contain types or runtime adapters that cannot be represented by generated exports.

Token path changes affect generated symbol names. Treat renaming or moving a token path as a public-API change once generated exports are consumed outside the package.

## Canonical token format

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

### Repository rules for DTCG

- Use `$value`, never legacy `value`.
- Use `$type` on each token or inherit it from an unambiguous group.
- Prefer native DTCG primitive types such as `dimension`, `number`, `duration`, and `string` when supported by the pinned Style Dictionary version.
- Dimensions must use DTCG dimension objects with explicit units: `{ "value": 8, "unit": "px" }` or `rem`.
- Do not encode dimensions as bare numbers.
- Aliases use DTCG/Style Dictionary references such as `{shape.small}` and may cross files.
- Do not put upstream revision/provenance metadata into canonical token files. Upstream source mapping belongs in audit code.
- Do not add project-specific `$extensions` unless a concrete cross-tool requirement appears and is separately reviewed.

### Dynamic Material colors

ThemeProvider owns actual runtime Material color values. Canonical component tokens refer to runtime roles as ordinary strings:

```json
{
  "containerColor": {
    "$type": "string",
    "$value": "var(--primary)"
  }
}
```

Do not convert these values to static hex colors and do not mark them as DTCG `color` tokens. They are runtime CSS-variable references, not static color data.

## DTCG compatibility

Style Dictionary has first-class DTCG support from v4 and normally auto-detects DTCG input. Do not set `usesDtcg` in config unless there is a demonstrated auto-detection problem.

The Style Dictionary docs currently warn that the latest DTCG 2025.10 format is not yet fully supported. Version 5.4 added support for the 2025.10 dimension object form across built-in transforms. Before introducing a new DTCG type or composite shape, verify support in the docs/changelog for the exact pinned Style Dictionary version and add generated-output tests.

## `source`, `include`, and `tokens`

### Style Dictionary behavior

- `source` is an array of glob patterns. All matched token files are deep-merged.
- `include` is a base collection; matching `source` tokens override matching `include` tokens.
- `tokens` can provide inline token objects from config.

### Repository rule

Use only:

```js
source: ['tokens/**/*.json']
```

Do not use `include` for AndroidX, Figma, Material Web, or any other upstream reference. Upstreams are audit oracles only and must never enter the Style Dictionary build graph.

Do not put canonical tokens inline in config. Canonical values belong in `tokens/**/*.json`, where they can be reviewed and diffed independently of build configuration.

## Configuration format

Style Dictionary supports JSON, JSONC, JSON5, and JavaScript ES module configs.

### Repository rule

Use a JavaScript ES module config named:

```text
packages/tokens/style-dictionary.config.mjs
```

Use JS rather than JSON because this repository requires enum constants, strict logging, and may later need filters without inventing stringly-typed config.

The package script must invoke the config explicitly:

```json
{
  "scripts": {
    "tokens:build": "style-dictionary build --config style-dictionary.config.mjs"
  }
}
```

## Canonical config pattern

Use Style Dictionary enum-like constants instead of hardcoded built-in names:

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

### Why this config is the default

- `source` reads only canonical DTCG.
- `warnings: error` makes source token collisions, generated name collisions, empty filtered files, and related warnings fail CI instead of being silently tolerated.
- broken references throw.
- `transformGroups.js` supplies the official JS transform group.
- `buildPath` ends with `/`, as required by Style Dictionary config semantics.
- `javascript/es6` and `typescript/es6-declarations` are built-in formats; do not replace them with a custom generator without a proven requirement.
- `outputStringLiterals: true` preserves literal string types in generated declarations.
- `showFileHeader: false` removes generated timestamps and keeps output deterministic.

## Transform groups are not neutral

A transform group is an ordered list of transforms. The built-in `js` group currently includes:

- `attribute/cti`;
- `name/pascal`;
- `size/rem`;
- `color/hex`.

Do not assume a transform group merely changes names.

### Repository consequences

- Generated JS identifiers are PascalCase path-derived names.
- Runtime CSS-variable color references are `$type: string`, so the color transform must not reinterpret them as static colors.
- Canonical dimensions use explicit DTCG `px`/`rem` units. Style Dictionary 5.4+ supports these dimension objects; generated-output tests must verify the exact serialized values we depend on.
- If a consumer needs a different unit conversion, create a separate platform or deliberate transform path. Do not rewrite canonical units to fit one platform.

When adding standalone `transforms` alongside a `transformGroup`, remember that Style Dictionary appends standalone transforms after the group. If transform ordering matters, define a reviewed custom transform group rather than depending on accidental ordering.

## Platforms

A platform is an output target, not a canonical token layer.

Each platform may define:

- `transformGroup` and/or ordered `transforms`;
- `buildPath`;
- `files`;
- `options`;
- `prefix`;
- `preprocessors`;
- `expand`;
- `actions`.

### Repository rules

- Add a platform only when there is a real consumer with different output semantics.
- Do not duplicate source trees to create platform-specific values.
- Avoid `prefix` for the JS public API unless explicitly required; changing it renames every generated export.
- Keep platform-specific configuration in config, not token files.

## Files and formats

A platform `files` array describes generated files. `destination` is appended to the platform `buildPath`.

Use built-in formats first.

For this package, the default pair is:

- `formats.javascriptEs6` -> `tokens.js`;
- `formats.typescriptEs6Declarations` -> `tokens.d.ts`.

A custom format is justified only when built-in output cannot satisfy a real public API requirement. Before registering one, check the built-in formats and format helpers.

Keep custom format options under the file/platform `options` object because Style Dictionary merges platform and file options and gives file-level values precedence.

## Filters and split outputs

If consumers later require one output file per component, do **not** create separate canonical source roots or separate Style Dictionary instances per component by default.

Use the official split-output pattern:

1. keep one merged canonical source graph;
2. generate multiple `files` entries;
3. apply file-level `filter`s so each output receives the relevant subset.

Style Dictionary filters run after transforms and before formats.

Be careful when combining filters with reference-preserving formats: a token may reference a token filtered out of the file. Use Style Dictionary's reference helpers / `outputReferencesFilter` where appropriate instead of emitting broken references.

## References and `outputReferences`

Style Dictionary resolves aliases by default before formatting.

Only some built-in formats support `outputReferences`; `javascript/es6` is not one of the documented reference-preserving formats. Therefore JS output should be treated as resolved values.

For CSS-variable output, `css/variables` can preserve aliases with `outputReferences: true` when that is intentionally desired.

Do not enable `outputReferences` mechanically. Preserve aliases only when the output format and consumer benefit from the reference chain and the filtered output still contains valid referenced tokens.

The runtime Material strings such as `var(--primary)` are literal token values, not Style Dictionary aliases, so they do not require `outputReferences`.

## Composite tokens and `expand`

`expand` is `false` by default. It decomposes object-valued composite tokens into separate tokens.

### Repository rule

Do not enable `expand: true` globally as a convenience.

If the canonical model later uses DTCG composite tokens such as typography, border, shadow, or transition:

1. verify exact support in the pinned Style Dictionary version;
2. decide whether the target format can consume the composite value directly;
3. if expansion is needed, prefer deliberate platform-level `expand` configuration;
4. test the generated token names and types.

Global expansion cannot be undone by a platform-level config, so it has a much larger blast radius.

## Parsers, preprocessors, transforms, formats, actions

Use extension hooks only at the lifecycle stage matching the problem:

- parser: custom input file syntax;
- preprocessor: mutate/normalize the merged dictionary before transforms;
- transform: platform-specific token name/attribute/value conversion;
- filter: choose which transformed tokens enter a file;
- format: serialize a file;
- action: post-build side effect such as copying assets.

### Repository rule

Prefer zero custom hooks. The canonical source should be valid DTCG JSON and standard JS/TS generation should use built-ins.

Never write a custom generator simply to reshape data that should have been modeled correctly in canonical DTCG.

## Generated API

Generated files are disposable build artifacts, but once package consumers import their exports, the generated names are public API.

Rules:

- never hand-edit `dist/generated/**`;
- never commit a second handwritten copy of generated token values;
- build JS and declarations from the same platform/naming transform;
- tests must import actual generated JS, not a hand-maintained mirror;
- package exports should point to generated artifacts only after those artifacts are stable and tested;
- public type-only helpers may remain handwritten when Style Dictionary cannot express the ergonomic TypeScript API, but they must not duplicate values.

## Validation and testing pattern

Every token change should pass these layers:

1. **Canonical validation**
   - parse every `tokens/**/*.json` file;
   - merge into one graph;
   - reject duplicate canonical paths;
   - reject unsupported types;
   - reject missing aliases and alias cycles;
   - reject legacy `value` fields.

2. **Style Dictionary build test**
   - run the real pinned Style Dictionary binary;
   - import `dist/generated/tokens.js`;
   - assert representative dimensions, numbers, aliases, runtime CSS-variable strings, and generated names;
   - inspect `tokens.d.ts` for expected declarations/literal strings.

3. **Upstream audit**
   - normalize AndroidX/Figma/etc. into read-only reference graphs;
   - compare against canonical;
   - never rewrite canonical from upstream.

4. **Consumer tests**
   - migrate components to generated exports;
   - run unit/type/build tests;
   - run visual regression when rendering may be affected.

## Determinism

Published/generated output must be reproducible from the same canonical source, config, and pinned Style Dictionary version.

Rules:

- pin the Style Dictionary version in `package.json` and lockfile;
- disable timestamped generated headers;
- fail warnings in CI;
- never depend on upstream network data during the package build;
- upstream network access belongs only in explicit audit commands;
- do not commit generated data whose contents depend on current time or source fetch order.

## Anti-patterns

Do not:

- treat AndroidX/Figma/Material Web as Style Dictionary `source` or `include`;
- generate canonical DTCG from upstream;
- maintain one giant token JSON because Style Dictionary can deep-merge files;
- rely on duplicate source paths being overwritten by merge order;
- organize canonical tokens by target platform;
- hardcode Style Dictionary format/transform names in JS config when enums exist;
- set `usesDtcg: true` without a demonstrated need;
- silence warnings that should fail CI;
- add custom transforms or formats before checking built-ins;
- enable `expand` globally without a composite-token design;
- assume `transformGroup: js` preserves values untouched;
- expect JS built-in formats to preserve Style Dictionary aliases;
- hand-edit `dist/generated`;
- copy generated values back into handwritten TypeScript modules.

## Change checklist

When changing tokens or config:

- [ ] canonical file is under `tokens/core` or `tokens/component`;
- [ ] token path is defined once across the full source graph;
- [ ] DTCG `$type` / `$value` is used;
- [ ] dimensions have explicit `px` or `rem` units;
- [ ] reusable value aliases a `core` token instead of being copied;
- [ ] dynamic Material color is a `var(--role)` string if it is ThemeProvider-owned;
- [ ] config uses official enums for built-ins;
- [ ] no upstream reference was added to `source`/`include`;
- [ ] no unnecessary custom hook was added;
- [ ] real Style Dictionary generated-output tests pass;
- [ ] declaration output still matches JS names;
- [ ] consumer tests pass;
- [ ] visual regression passes when applicable.

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
