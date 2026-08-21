# m3-ui

React component library monorepo built with Turborepo, TypeScript, plain CSS and React Aria Components.

## Workspace

- `packages/tokens`: framework-agnostic Material token package
- `packages/ui`: React component library
- `apps/storybook`: component preview and visual review workspace
- `apps/playground`: small Vite app for manual testing
- `docs/architecture`: Compose-to-TypeScript parity architecture and porting rules
- `scripts/compose-sync`: reserved tooling contract for syncing generated Material token data

## Commands

```bash
pnpm install
pnpm storybook
pnpm dev
pnpm test
pnpm test:visual
pnpm build
pnpm typecheck
```

`pnpm storybook` starts Storybook on port 6006. `pnpm build:storybook` builds Storybook and its workspace dependencies, then creates the static preview under `apps/storybook/dist`.

Storybook is the primary visual review surface for components. New public components should add stories for their baseline, disabled/error states when applicable, and theme-sensitive rendering. Interaction states such as hover, press, and focus should continue to come from the real React Aria component instead of fake CSS classes.

Playwright provides the committed visual-regression layer on top of Storybook. `pnpm test:visual` builds the static Storybook and compares Chromium screenshots with the committed Linux baselines. When an intentional visual change has been reviewed, run `pnpm test:visual:update` inside the devcontainer and commit the changed files under `apps/storybook/visual/__screenshots__/`.

## Dev Container

The repository includes a Node.js 22 devcontainer under `.devcontainer/`. It activates pnpm 10.0.0, runs `pnpm install --frozen-lockfile`, and installs the Playwright Chromium headless shell plus its Linux dependencies when the container is created.

With VS Code and the Dev Containers extension:

1. Clone and open the repository.
2. Run **Dev Containers: Reopen in Container** from the command palette.
3. Wait for the post-create dependency and Chromium install to finish.
4. Start the visual preview:

```bash
pnpm storybook
```

Storybook is forwarded to `http://localhost:6006` and opens automatically when supported by the Dev Containers client.

To run the committed visual regression suite in the same Linux/Chromium environment as CI:

```bash
pnpm test:visual
```

To regenerate baselines after reviewing an intentional visual change:

```bash
pnpm test:visual:update
```

To run the wider development workspace instead:

```bash
pnpm dev
```

The Vite playground is forwarded to `http://localhost:5173`. Both Storybook and Vite bind to `0.0.0.0` so they remain reachable through the container port forwarding layer.

The container uses the non-root `node` user. The host repository stays mounted as the workspace, so source edits remain on the host while Node tooling runs inside the Linux container.

## Architecture before implementation

Read [`docs/architecture/README.md`](docs/architecture/README.md) before porting a Material 3 component from Jetpack Compose.

The project targets 1:1 parity in Material behavior, tokens, defaults, states, layout, and accessibility where those concepts apply to the web. It does **not** translate Kotlin/Compose runtime code line by line.

Key rules:

- AndroidX Material3 is pinned as a source of truth for parity work.
- Immutable/generated token data belongs in `@m3/tokens`; handwritten React implementation belongs in `@m3/ui`.
- `ThemeProvider` owns runtime theme values, not immutable specification constants.
- TypeScript must remain idiomatic; do not recreate `Modifier`, Kotlin `data class`, `.copy()`, `Dp`, or `InteractionSource` APIs.
- Native HTML and React Aria Components provide web semantics and interaction state.
- Visual state should be CSS-first when possible.
- Parity is proven by independent token/default/behavior/layout tests plus Chromium visual regression for covered stories.

## Component convention

Each public component family lives in its own folder under `packages/ui/src/components/`.

A simple component may look like:

```text
packages/ui/src/components/Button/
├── Button.tsx
├── Button.types.ts
├── Button.defaults.ts
├── button.css
└── index.ts
```

Do not create files mechanically; use only the separation a component actually needs. Complex component families may add an internal folder for layout/decoration logic.

See [`packages/ui/src/components/README.md`](packages/ui/src/components/README.md) for the detailed component-layer contract.
