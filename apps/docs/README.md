# m3-ui documentation app

This app is the public documentation host for `m3-ui`.

## Ownership

Next.js App Router owns route rendering, metadata, and server/client boundaries. Fumadocs is used headlessly for the documentation content model:

- `fumadocs-mdx` compiles local Markdown/MDX content and integrates with Next.js;
- `fumadocs-core` provides source, page-tree, TOC, and search APIs;
- `fumadocs-ui`, its CSS presets, and Tailwind are intentionally not dependencies.

The visible product surface is owned by `m3-ui`:

- `ThemeProvider` owns Material light/dark colors and typeface roles;
- screen composition uses public `@m3-ui/ui/layout` APIs;
- navigation, search and app-bar UI use public `@m3-ui/ui` components;
- Markdown typography maps to the public Material type scale from `@m3-ui/ui`;
- docs-only constructs such as code blocks, breadcrumbs, previous/next navigation, API reference tables, parity summaries, semantic tables, component previews, color swatches, and type-scale visualizers remain local adapters.

## Documentation shell

The public docs render as a documentation product rather than a centered MDX demo host.

`DocsShell` separates global destinations from contextual navigation instead of flattening the full documentation tree into one drawer:

- Material `Scaffold` owns the screen coordinate space, safe-area handling, and `TopAppBar` slot;
- compact and medium Material width classes use `ModalNavigationDrawer` as a two-level hierarchy: the main menu selects a top-level section, then the section view exposes only that section subtree with a semantic `Main menu` back action;
- expanded uses a persistent global `NavigationRail` while contextual section navigation remains modal so the article retains useful reading width;
- large and extra-large use the global rail plus a persistent contextual `PermanentDrawerSheet` when the active top-level destination is a folder;
- top-level leaf destinations navigate directly and do not create an empty contextual pane;
- extra-large additionally shows the current page TOC as an independent supporting documentation column;
- the article remains a bounded readable column inside the remaining workspace;
- breadcrumb and previous/next navigation are derived from the same page tree as both navigation layers.

The app consumes `useWindowAdaptiveInfo()` from `@m3-ui/ui/layout`. It must not copy the Material window thresholds into CSS or JavaScript. The named Material classes may be mapped to docs-specific composition decisions, but their breakpoint values stay owned by the canonical layout subsystem.

Navigation ordering and grouping are source data, not JSX inventory. `content/docs/**/meta.json` configures the Fumadocs page tree. `scripts/build-docs-data.mjs` loads the shared Fumadocs source, normalizes runtime-safe text fields, and writes `src/generated/docs-navigation.json` before dev/build/typecheck. The generated JSON is imported by the Next.js docs shell, so the first rendered frame already contains navigation.

Route navigation uses semantic links. `NavigationRailLink` and `NavigationDrawerLink` preserve the canonical Material rail/drawer visual contracts while exposing native link semantics and `aria-current`. Drawer hierarchy actions such as drill-in and back use `NavigationDrawerButton`. Do not force `NavigationRailItem` or `NavigationDrawerItem` into document navigation merely for visual treatment: those item components intentionally expose tab-style selection semantics.

Rail and drawer geometry, shape, colors, typography, ripple and interaction state layers remain owned by `@m3-ui/ui` defaults and generated Material tokens. Docs CSS only composes the rail, contextual navigation stage, article workspace, and TOC; it must not restyle canonical navigation items.

The page TOC comes from each MDX page's generated `toc` and Fumadocs `AnchorProvider`/`TOCItem`. Do not parse headings in the browser or maintain a second TOC list manually.

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

The reusable page-authoring primitives and canonical MDX template live under `authoring/` and `src/componentPageMdxComponents.tsx`. These are documentation adapters; they do not replace public component pages with TSX routes.

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

## Static docs data and search

`scripts/build-docs-data.mjs` is the single build-time Fumadocs data pass:

- it registers the `fumadocs-mdx` macro loader needed to import the shared `src/lib/source.ts` definition in Node;
- `src/lib/source.ts` defines the collection once and exposes the same `fumadocs-core/source` loader used by App Router routes and build-time data generation;
- `source.getPageTree()` produces the navigation hierarchy consumed by `DocsShell`;
- `createFromSource(source).staticGET()` exports the built-in ZBSearch database to `public/search-index.json`;
- Next.js bundles the generated navigation JSON, while the static search database is served from `public/`.

`DocsSearch` queries the static database with `useDocsSearch()` and `staticClient()` from `fumadocs-core`. The visible search experience remains Material UI: the top-app-bar action uses `IconButton`, the expanded surface uses `ExpandedFullScreenSearchBar` and `SearchBarInput`, and result visuals use `ListItem` inside semantic links.

Do not add a second client-side search implementation for titles or manually parsed MDX. If Fumadocs data cannot be generated, fix the source/data pipeline instead.

## Layout boundary

The docs app consumes the public Material layout subsystem; it does not reimplement it.

Do not add docs-owned compact/medium/expanded numeric breakpoints, pane directives, window-class calculators, hinge policies, or alternate scaffold algorithms. `Scaffold`, Material window classification, canonical pane logic, and safe-area behavior stay owned by `@m3-ui/ui/layout`.

Docs-only widths such as the readable article measure, sidebar presentation width, and TOC column width are application composition values. They must not be exported or described as Material layout tokens.

## MDX mapping

`src/mdx.tsx` is the server-facing MDX registry. It maps Markdown and docs primitives to named client proxies so App Router can keep page/content resolution server-side without passing non-serializable component functions across the RSC boundary. `src/mdx-client.tsx` owns the corresponding client implementations and Material type-role mappings.

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

The Next.js development server listens on port `4173`.
