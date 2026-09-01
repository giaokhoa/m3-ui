# m3-ui documentation app

This app is the public documentation host for `m3-ui`.

## Ownership

Fumadocs is used headlessly:

- `fumadocs-mdx` compiles local Markdown/MDX content;
- `fumadocs-core` provides source, page-tree, and search APIs;
- `fumadocs-ui`, its CSS presets, and Tailwind are intentionally not dependencies.

The visible product surface is owned by `m3-ui`:

- `ThemeProvider` owns Material light/dark colors and typeface roles;
- interactive UI uses public `@m3-ui/ui` components;
- Markdown typography maps to the public Material type scale from `@m3-ui/ui`;
- docs-only constructs such as code blocks, parity summaries, semantic tables, component previews, color swatches, and type-scale visualizers remain local adapters.

## Foundation documentation contract

Only publish a foundation as a public docs section when the reusable runtime contract actually exists in `@m3-ui/ui` or its canonical token graph.

The current documented foundation scope is:

- semantic Material color roles and baseline/dynamic color schemes;
- Material standard and emphasized type scales;
- `ThemeProvider` propagation of color/typeface values, ripple focus configuration, and theme-aware portals.

Do not infer a global theme API from component-local tokens. Shape, motion, and elevation remain omitted from public foundation navigation until equivalent reusable runtime contracts are implemented and audited.

Foundation visualizers in `src/foundationDemos.tsx` must consume public theme/type APIs rather than copy Material values. Example source colors may be literal application inputs, but they must never be presented as canonical `m3-ui` tokens.

## Component page contract

Public component pages should describe the Material contract rather than mirror Storybook story inventory.

Each page should cover, where applicable:

1. Material family and upstream Material reference.
2. Compose mapping or the nearest audited Material contract.
3. Live examples rendered by the public `@m3-ui/ui` implementation.
4. Variants, sizes and meaningful states.
5. Accessibility and browser-native behavior.
6. Intentional web adaptations where a literal Compose runtime mapping would be wrong.

Shared parity metadata lives in `src/componentDocs.ts` and is rendered through the docs-only `MaterialParity` MDX primitive. Keep canonical measurements, typography, colors, elevations and component shapes in the token/component layers; do not duplicate them in MDX prose or docs CSS.

## Generated API reference

Public API tables are generated from the TypeScript surface reachable through `packages/ui/src/index.ts`. The docs app does not maintain a second handwritten prop inventory.

`scripts/build-api-reference.mjs` uses the TypeScript checker to resolve the public entrypoint, aliases and component prop types. The generated model includes:

- public component/function/type signatures;
- public component props and statically knowable defaults;
- inherited React Aria or other web props, with their origin kept separate from m3-ui-owned props;
- JSDoc descriptions;
- optional `@source`, `@provenance`, `@material`, `@compose`, `@web`, and `@adaptation` annotations when source metadata provides them;
- repository-relative source locations.

The generated JSON is written to `src/generated/api-reference.generated.json` before docs dev, build, test and typecheck. It is deterministic build output and is intentionally ignored by Git.

Component MDX pages consume the runtime primitive directly without importing app TSX modules:

```mdx
## API reference

<ApiReference name="Button" />
```

`name` must be an actual public export from `@m3-ui/ui`. Removed, renamed or internal-only symbols are not silently documented: generation/runtime validation fails loudly instead. Use `showInherited` only when the page should initially expand the inherited React/web prop table:

```mdx
<ApiReference name="TextField" showInherited />
```

Do not copy generated signatures or prop rows into MDX. If the generated output is wrong, fix the public type/JSDoc surface or the extractor rather than creating a local override table. The non-public fixture under `scripts/fixtures/api-reference.mdx` protects the MDX embedding contract without creating a user-facing TSX API route.

## Static search

Documentation search uses the Fumadocs search pipeline rather than a docs-local title filter:

- `scripts/build-search-index.mjs` loads the Macro collection through the official `fumadocs-mdx/node` loader;
- `fumadocs-core/source` turns the collection into the same source/page model used by Fumadocs;
- `createFromSource(source).staticGET()` exports the built-in ZBSearch database;
- development writes the generated database to `public/search-index.json`, which Vite serves as a static asset;
- production writes `dist/search-index.json` after `vite build`;
- `DocsSearch` queries that file with `useDocsSearch()` and `staticClient()` from `fumadocs-core`.

The visible search experience is still Material UI: the top-app-bar action uses `IconButton`, the expanded surface uses `ExpandedFullScreenSearchBar` and `SearchBarInput`, and result visuals use `ListItem` inside semantic links.

Do not add a second client-side search implementation for titles or manually parsed MDX. If the Fumadocs static index cannot be generated, fix the source/index pipeline instead.

The generated development index is ignored by Git and is refreshed when the docs dev command starts. Restart the docs dev server after content changes when search results need to be re-indexed.

## Adaptive layout boundary

Do not introduce a second responsive system here.

The documentation app may compose public navigation components and `@m3-ui/ui/layout`, but it must not own Material window-size classes, compact/medium/expanded breakpoints, pane directives, canonical pane scaffolds, hinge avoidance, or equivalent adaptive algorithms.

Until the current layout work provides the desired docs composition, this app deliberately remains a single-content surface with a Material `TopAppBar`. App-specific prose width, wrapping and spacing are readability concerns, not exported Material layout contracts.

## MDX mapping

`src/mdx.tsx` maps semantic Markdown elements to Material type roles without copying typography literals. There is no public `Typography` or `Prose` component added solely for documentation.

Code uses a monospace browser adaptation because Material does not define a code typography role; its surrounding color surfaces still use Material semantic roles and the `Surface` component.

Semantic documentation tables are docs adapters rather than Material components. Their typography and colors use Material theme roles, but they do not invent a public Material table API.

## Development

```bash
pnpm --filter @m3-ui/docs api:generate
pnpm --filter @m3-ui/docs dev
pnpm --filter @m3-ui/docs build
pnpm --filter @m3-ui/docs test
pnpm --filter @m3-ui/docs typecheck
```

The Vite development server listens on port `4173`.
