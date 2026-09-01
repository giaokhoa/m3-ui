# m3-ui documentation app

This app is the public documentation host for `m3-ui`.

## Ownership

Fumadocs is used headlessly:

- `fumadocs-mdx` compiles local Markdown/MDX content;
- `fumadocs-core` provides source, page-tree, TOC, and search APIs;
- `fumadocs-ui`, its CSS presets, and Tailwind are intentionally not dependencies.

The visible product surface is owned by `m3-ui`:

- `ThemeProvider` owns Material light/dark colors and typeface roles;
- screen composition uses public `@m3-ui/ui/layout` APIs;
- navigation, search and app-bar UI use public `@m3-ui/ui` components;
- Markdown typography maps to the public Material type scale from `@m3-ui/ui`;
- docs-only constructs such as code blocks, breadcrumbs, previous/next navigation, parity summaries, semantic tables, component previews, color swatches, and type-scale visualizers remain local adapters.

## Documentation shell

The public docs must render as a normal documentation product rather than a centered MDX demo host.

`DocsShell` owns the persistent shell:

- Material `Scaffold` owns the screen coordinate space, safe-area handling, and `TopAppBar` slot;
- compact and medium Material width classes use `ModalNavigationDrawer` with an app-bar navigation action;
- expanded, large, and extra-large Material width classes use a permanent `PermanentDrawerSheet` sidebar;
- large and extra-large classes additionally show the current page TOC as a supporting documentation column;
- the article remains a bounded readable column inside the remaining workspace;
- breadcrumb and previous/next navigation are derived from the same page tree as the sidebar.

The app consumes `useWindowAdaptiveInfo()` from `@m3-ui/ui/layout`. It must not copy the Material window thresholds into CSS or JavaScript. The named Material classes may be mapped to docs-specific composition decisions, but their breakpoint values stay owned by the canonical layout subsystem.

Sidebar ordering and grouping are source data, not JSX inventory. `content/docs/**/meta.json` configures the Fumadocs page tree. `scripts/build-docs-data.mjs` loads that tree through the official Fumadocs loader, normalizes runtime-safe text fields, and writes `src/generated/docs-navigation.json` before dev/build/typecheck. The generated file is ignored by Git and bundled statically by Vite, so the first rendered frame already contains navigation.

Documentation navigation uses semantic links. Do not force `NavigationDrawerItem` into this surface merely for its visual treatment: that component intentionally exposes tab-style selection semantics, while document navigation is a hierarchy of links.

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

## Static docs data and search

`scripts/build-docs-data.mjs` is the single build-time Fumadocs data pass:

- it loads the Macro collection through the official `fumadocs-mdx/node` loader;
- `fumadocs-core/source` creates the same source/page model used by Fumadocs;
- `source.getPageTree()` produces the navigation hierarchy consumed by `DocsShell`;
- `createFromSource(source).staticGET()` exports the built-in ZBSearch database to `public/search-index.json`;
- Vite bundles the generated navigation JSON and copies the search database into production output.

`DocsSearch` queries the static database with `useDocsSearch()` and `staticClient()` from `fumadocs-core`. The visible search experience remains Material UI: the top-app-bar action uses `IconButton`, the expanded surface uses `ExpandedFullScreenSearchBar` and `SearchBarInput`, and result visuals use `ListItem` inside semantic links.

Do not add a second client-side search implementation for titles or manually parsed MDX. If Fumadocs data cannot be generated, fix the source/data pipeline instead.

## Layout boundary

The docs app now consumes the public Material layout subsystem; it still does not reimplement it.

Do not add docs-owned compact/medium/expanded numeric breakpoints, pane directives, window-class calculators, hinge policies, or alternate scaffold algorithms. `Scaffold`, Material window classification, canonical pane logic, and safe-area behavior stay owned by `@m3-ui/ui/layout`.

Docs-only widths such as the readable article measure, sidebar presentation width, and TOC column width are application composition values. They must not be exported or described as Material layout tokens.

## MDX mapping

`src/mdx.tsx` maps semantic Markdown elements to Material type roles without copying typography literals. There is no public `Typography` or `Prose` component added solely for documentation.

Code uses a monospace browser adaptation because Material does not define a code typography role; its surrounding color surfaces still use Material semantic roles and the `Surface` component.

Semantic documentation tables are docs adapters rather than Material components. Their typography and colors use Material theme roles, but they do not invent a public Material table API.

## Development

```bash
pnpm --filter @m3-ui/docs dev
pnpm --filter @m3-ui/docs build
pnpm --filter @m3-ui/docs typecheck
```

The Vite development server listens on port `4173`.
