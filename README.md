# m3-ui

React component library monorepo built with Turborepo, TypeScript, plain CSS and React Aria Components.

## Workspace

- `packages/tokens`: canonical DTCG tokens, Style Dictionary build output, validation and read-only upstream audits
- `packages/ui`: React component library, including Material widgets and the separate layout subsystem
- `apps/docs`: public documentation powered headlessly by Fumadocs and rendered with `m3-ui`
- `apps/storybook`: component preview and visual review workspace
- `apps/playground`: small Vite app for manual testing
- `docs/architecture`: Compose-to-TypeScript parity architecture and porting rules

## Commands

```bash
pnpm install
pnpm dev
pnpm build
pnpm --filter @m3-ui/docs dev
pnpm --filter @m3-ui/storybook dev
pnpm --filter @m3-ui/storybook test:visual
pnpm --filter @m3-ui/tokens audit:androidx
```

`pnpm dev` runs workspace development tasks through Turborepo. The docs app listens on port 4173, the playground on 5173, and Storybook on 6006.

The public docs use `fumadocs-mdx` and `fumadocs-core` as a headless content pipeline. They intentionally do not use `fumadocs-ui`, its visual presets, or a second Material-like design system. Interactive documentation UI is composed from `@m3-ui/ui`; semantic Markdown typography uses the same canonical Material type scale as the component library.

Storybook remains the primary visual review surface for components. New public components should add stories for their baseline, disabled/error states when applicable, and theme-sensitive rendering. Interaction states such as hover, press, and focus should continue to come from the real React Aria component instead of fake CSS classes.

Playwright provides the committed visual-regression layer on top of Storybook. `pnpm --filter @m3-ui/storybook test:visual` builds the static Storybook and compares Chromium screenshots with the committed Linux baselines. When an intentional visual change has been reviewed, run `pnpm --filter @m3-ui/storybook test:visual:update` inside the devcontainer and commit the changed files under `apps/storybook/visual/__screenshots__/`.

## Layout subsystem

Material layout is a separate public subsystem from Material widget components:

```ts
import {
  ListDetailPaneScaffold,
  SupportingPaneScaffold,
  ThreePaneScaffold,
  calculatePaneScaffoldDirective,
  calculateWindowAdaptiveInfo,
} from '@m3-ui/ui/layout';
```

Source ownership mirrors that boundary:

- `packages/ui/src/components/`: Material UI widget families.
- `packages/ui/src/layout/adaptive/`: window-size classes, posture, pane directives and pane adaptation algorithms.
- `packages/ui/src/layout/components/`: Material screen and pane composition components such as `Scaffold` and the canonical multi-pane scaffolds.

The root `@m3-ui/ui` entry still re-exports layout APIs for convenience and compatibility. `@m3-ui/ui/layout` is the dedicated runtime/type entry when an application wants the layout subsystem explicitly.

Generic Compose runtime primitives are not translated mechanically. Browser Flexbox/Grid/logical properties remain the native layout mechanics; Material-specific breakpoints, pane partitioning, preferred sizes, hinge avoidance, RTL placement and canonical layouts are the parity contract. See `packages/ui/src/layout/README.md` for the detailed mapping rules.

The docs app must compose this subsystem rather than own a parallel responsive model. Until the desired Material adaptive composition lands here, `apps/docs` deliberately stays a single-content surface instead of inventing its own compact/medium/expanded breakpoints or pane behavior.

## CSS consumption

For applications that use many Material components, import the complete stylesheet once:

```ts
import '@m3-ui/ui/styles.css';
```

For smaller bundles, each public CSS-bearing family also has a self-contained CSS entry. For example:

```ts
import '@m3-ui/ui/styles/button.css';
import '@m3-ui/ui/styles/text-field.css';
import '@m3-ui/ui/styles/three-pane-scaffold.css';
```

Each modular entry includes the internal styles its public family needs, so a consumer does not need to know internal style dependencies. `ThreePaneScaffold`, `ListDetailPaneScaffold` and `SupportingPaneScaffold` share the `three-pane-scaffold.css` layout entry. If an application uses many families, prefer the single full stylesheet to avoid duplicate shared primitive CSS.

`BottomSheet` is the direct-hierarchy Material surface. Place it in a bounded positioning context (for example a `position: relative` screen container); `SheetState` owns Hidden/PartiallyExpanded/Expanded anchors and drag settling while the parent owns stacking and clipping. `ModalBottomSheet` composes the same state/gesture engine with a React Aria modal portal, Material scrim, focus containment, Escape/outside dismissal and focus restoration. Modal dismissal first animates the sheet to Hidden and only then invokes `onDismissRequest`, matching the pinned AndroidX lifecycle.

`PermanentNavigationDrawer` lays out the standard Material surface beside application content. `DismissibleNavigationDrawer` uses the same standard sheet but moves application content with the measured drawer offset, while `ModalNavigationDrawer` overlays content with the Material scrim and a modal `surface-container-low` sheet. `DrawerState` owns Closed/Open confirmation and the AndroidX 50% / 400px·s⁻¹ settling thresholds. React Aria owns modal portal/focus containment/Escape/focus restoration; horizontal pointer drag is a web adaptation of Compose `anchoredDraggable`, including logical RTL direction. Android predictive-back progress has no equivalent browser progress API, so it remains an explicit platform adaptation rather than a fabricated gesture.

## Dev Container

The repository includes a Node.js 22 devcontainer under `.devcontainer/`. It activates pnpm 10.0.0, runs `pnpm install --frozen-lockfile`, and installs the Playwright Chromium headless shell plus its Linux dependencies when the container is created.

With VS Code and the Dev Containers extension:

1. Clone and open the repository.
2. Run **Dev Containers: Reopen in Container** from the command palette.
3. Wait for the post-create dependency and Chromium install to finish.
4. Run `pnpm dev` for the workspace or start an individual app with its package-level `dev` script.

The docs app is forwarded on `http://localhost:4173`, the Vite playground on `http://localhost:5173`, and Storybook on `http://localhost:6006`.

## Architecture before implementation

Read [`docs/architecture/README.md`](docs/architecture/README.md), [`packages/ui/src/layout/README.md`](packages/ui/src/layout/README.md), and [`packages/tokens/README.md`](packages/tokens/README.md) before porting Material 3 layout or components.

Key rules:

- `packages/tokens/tokens/**/*.json` is the manually reviewed canonical token graph.
- Style Dictionary generates package artifacts from canonical DTCG; generated output is never edited by hand.
- AndroidX Material3 is pinned and read only: upstream data is parsed in memory for audits and never generates canonical or runtime token files.
- Immutable design values belong in the token graph; `ThemeProvider` owns runtime theme values such as dynamic colors.
- Native HTML and React Aria Components provide web semantics and interaction state.
- Parity is proven by independent token/default/behavior/layout tests plus Chromium visual regression for covered stories.

## Source convention

Each public Material widget family lives in its own folder under `packages/ui/src/components/`. Material layout contracts and layout components live under `packages/ui/src/layout/`. Keep public files small, prefer browser-native layout/semantics where they express the contract, and do not duplicate canonical token values in implementation code.
