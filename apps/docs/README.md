# m3-ui documentation app

This app is the public documentation host for `m3-ui`.

## Ownership

Fumadocs is used headlessly:

- `fumadocs-mdx` compiles local Markdown/MDX content;
- `fumadocs-core` remains available for headless Fumadocs integrations;
- `fumadocs-ui`, its CSS presets, and Tailwind are intentionally not dependencies.

The visible product surface is owned by `m3-ui`:

- `ThemeProvider` owns Material light/dark colors and typeface roles;
- interactive UI uses public `@m3-ui/ui` components;
- Markdown typography maps to the public Material type scale from `@m3-ui/ui`;
- docs-only constructs such as code blocks, parity summaries, semantic tables, and component previews remain local adapters.

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
pnpm --filter @m3-ui/docs dev
pnpm --filter @m3-ui/docs build
pnpm --filter @m3-ui/docs typecheck
```

The Vite development server listens on port `4173`.
