# m3-ui

React component library monorepo built with Turborepo, TypeScript, plain CSS and React Aria Components.

## Workspace

- `packages/tokens`: canonical DTCG tokens, Style Dictionary build output, validation and read-only upstream audits
- `packages/ui`: React component library
- `apps/storybook`: component preview and visual review workspace
- `apps/playground`: small Vite app for manual testing
- `docs/architecture`: Compose-to-TypeScript parity architecture and porting rules

## Commands

```bash
pnpm install
pnpm storybook
pnpm dev
pnpm test
pnpm test:visual
pnpm build
pnpm typecheck
pnpm --filter @m3/tokens audit:androidx
```

`pnpm storybook` starts Storybook on port 6006. `pnpm build:storybook` builds Storybook and its workspace dependencies, then creates the static preview under `apps/storybook/dist`.

Storybook is the primary visual review surface for components. New public components should add stories for their baseline, disabled/error states when applicable, and theme-sensitive rendering. Interaction states such as hover, press, and focus should continue to come from the real React Aria component instead of fake CSS classes.

Playwright provides the committed visual-regression layer on top of Storybook. `pnpm test:visual` builds the static Storybook and compares Chromium screenshots with the committed Linux baselines. When an intentional visual change has been reviewed, run `pnpm test:visual:update` inside the devcontainer and commit the changed files under `apps/storybook/visual/__screenshots__/`.

## CSS consumption

For applications that use many Material components, import the complete stylesheet once:

```ts
import '@m3/ui/styles.css';
```

For smaller bundles, each public component family also has a self-contained CSS entry. For example:

```ts
import '@m3/ui/styles/button.css';
import '@m3/ui/styles/text-field.css';
```

Available modular entries are `badge.css`, `button.css`, `card.css`, `checkbox.css`, `chip.css`, `divider.css`, `drag-handle.css`, `fab.css`, `icon-button.css`, `loading-indicator.css`, `progress-indicator.css`, `radio-button.css`, `slider.css`, `switch.css`, `text-field.css`, and `tooltip.css`. Each entry includes the internal Ripple/Elevation CSS that its component needs, so a consumer does not need to know internal style dependencies. If an application uses many component families, prefer the single full stylesheet to avoid duplicate shared primitive CSS.

## Dev Container

The repository includes a Node.js 22 devcontainer under `.devcontainer/`. It activates pnpm 10.0.0, runs `pnpm install --frozen-lockfile`, and installs the Playwright Chromium headless shell plus its Linux dependencies when the container is created.

With VS Code and the Dev Containers extension:

1. Clone and open the repository.
2. Run **Dev Containers: Reopen in Container** from the command palette.
3. Wait for the post-create dependency and Chromium install to finish.
4. Start the visual preview with `pnpm storybook`.

Storybook is forwarded to `http://localhost:6006` and opens automatically when supported by the Dev Containers client. The Vite playground is forwarded to `http://localhost:5173`.

## Architecture before implementation

Read [`docs/architecture/README.md`](docs/architecture/README.md) and [`packages/tokens/README.md`](packages/tokens/README.md) before porting a Material 3 component.

Key rules:

- `packages/tokens/tokens/**/*.json` is the manually reviewed canonical token graph.
- Style Dictionary generates package artifacts from canonical DTCG; generated output is never edited by hand.
- AndroidX Material3 is pinned and read only: upstream data is parsed in memory for audits and never generates canonical or runtime token files.
- Immutable design values belong in the token graph; `ThemeProvider` owns runtime theme values such as dynamic colors.
- Native HTML and React Aria Components provide web semantics and interaction state.
- Parity is proven by independent token/default/behavior/layout tests plus Chromium visual regression for covered stories.

## Component convention

Each public component family lives in its own folder under `packages/ui/src/components/`. Keep public files small, prefer React Aria/native semantics, and do not duplicate canonical token values in component code.
