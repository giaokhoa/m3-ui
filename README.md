# m3-ui

React Material 3 component library monorepo built with Turborepo, TypeScript, plain CSS and React Aria Components.

This README documents the repository structure, runtime/build flow and development commands. Agent implementation policy lives under `.agents/skills/`.

## Workspace

```text
m3-ui/
├── packages/
│   ├── tokens/       canonical DTCG, Style Dictionary build, validation and upstream audits
│   └── ui/           React Material components, theme, internal primitives and layout
├── apps/
│   ├── docs/         Fumadocs-powered public documentation rendered with m3-ui
│   └── storybook/    component review and visual-regression surface
├── .agents/skills/   repository agent operating rules
└── AGENTS.md         agent skill entrypoints and scope rules
```

`packages/ui/src/components/` contains Material widget families. Material adaptive/screen layout is a separate public subsystem under `packages/ui/src/layout/`.

## Token, theme and component flow

The repository keeps immutable Material design data separate from runtime theme inputs:

```text
AndroidX / Figma / Material Web
        │
        └── read-only audit evidence
                    │
                    ▼
        packages/tokens/tokens/**/*.json
             canonical DTCG graph
                    │
                    ▼
             Style Dictionary
              ┌─────┴──────────┐
              ▼                ▼
       generated JS/TS   generated CSS adapters
              │                │
              └───────┬────────┘
                      ▼
                 @m3-ui/ui

runtime sourceColor / mode / contrast
                    │
                    ▼
               ThemeProvider
                    │
                    ▼
        scoped Material role CSS vars
                    │
                    ▼
         generated + handwritten CSS
```

Component semantic colors resolve through system roles. For example:

```text
Button filled container
    -> canonical Primary role
    -> var(--primary)
    -> ThemeProvider concrete runtime value
```

See [`packages/tokens/README.md`](packages/tokens/README.md) for the token/compiler structure and [`packages/ui/src/theme/README.md`](packages/ui/src/theme/README.md) for the current theme runtime flow.

## Commands

Install and run the workspace:

```bash
pnpm install
pnpm dev
pnpm build
```

Useful package commands:

```bash
pnpm --filter @m3-ui/ui test
pnpm --filter @m3-ui/ui typecheck
pnpm --filter @m3-ui/ui build

pnpm --filter @m3-ui/tokens validate
pnpm --filter @m3-ui/tokens test
pnpm --filter @m3-ui/tokens audit:androidx

pnpm --filter @m3-ui/docs dev
pnpm --filter @m3-ui/docs build

pnpm --filter @m3-ui/storybook dev
pnpm --filter @m3-ui/storybook test:visual
```

`pnpm dev` runs workspace development tasks through Turborepo. The docs app listens on port `4173` and Storybook on `6006`.

Preview runners can use `npm run dev -- --host 0.0.0.0 --port 4173 --strictPort` after installing and building the workspace. The root launcher generates the docs data and adapts those flags to the Next.js docs server; the requested port must be available.

## Package distribution readiness

The packages are not published yet. `@m3-ui/ui` and `@m3-ui/tokens` remain `private: true`; `0.0.0` is only a workspace placeholder, not a proposed first public version.

Use `pnpm release:dry-run` for the complete release-readiness gate. It combines the package policy guard, Changesets release-plan validation and the actual packed external-consumer smoke; use `--output <path>` to retain its JSON artifact report. The existing `pnpm test:package-policy` and `pnpm test:package-consumer` commands remain independently available and stay in normal CI. The release contract, blocked maintainer decisions, lockstep versioning policy and no-publish boundary are documented in [`release/README.md`](release/README.md).

## Documentation and visual review

The public docs use `fumadocs-mdx` and `fumadocs-core` headlessly. They do not use `fumadocs-ui`; visible documentation UI is composed from `@m3-ui/ui`. See [`apps/docs/README.md`](apps/docs/README.md) for the docs app structure.

Storybook is the primary component visual-review surface. Playwright provides committed Chromium visual regression on top of the static Storybook build. Intentional visual updates are generated with the Storybook `test:visual:update` script inside the devcontainer and committed under `apps/storybook/visual/__screenshots__/`.

## Layout subsystem

Material layout is available through the dedicated entrypoint:

```ts
import {
  ListDetailPaneScaffold,
  SupportingPaneScaffold,
  ThreePaneScaffold,
  calculatePaneScaffoldDirective,
  calculateWindowAdaptiveInfo,
} from '@m3-ui/ui/layout';
```

Source layout:

```text
packages/ui/src/layout/
├── adaptive/      window classes, posture, pane directives, pane state and algorithms
├── components/    Material screen/pane composition components
└── index.ts       public layout barrel
```

The package root also re-exports layout APIs for compatibility. See [`packages/ui/src/layout/README.md`](packages/ui/src/layout/README.md) for the current adaptive-layout implementation and parity coverage.

## CSS consumption

For applications using many component families, import the full stylesheet once:

```ts
import '@m3-ui/ui/styles.css';
```

For smaller bundles, public CSS-bearing families expose self-contained modular entries:

```ts
import '@m3-ui/ui/styles/button.css';
import '@m3-ui/ui/styles/text-field.css';
import '@m3-ui/ui/styles/three-pane-scaffold.css';
```

The UI style build expands required internal/generated adapter dependencies so consumers do not need to know the private CSS dependency graph.

## Theme runtime

`ThemeProvider` scopes Material system-role CSS variables and exposes JavaScript theme data for runtime consumers. With no `sourceColor`, the current implementation uses the repository baseline light/dark scheme. With `sourceColor`, it generates a Material dynamic scheme through Material Color Utilities.

Nested providers and Material overlays share the same theme through the themed portal container. The current implementation is documented in [`packages/ui/src/theme/README.md`](packages/ui/src/theme/README.md).

## Dev container

The repository includes a Node.js 22 devcontainer under `.devcontainer/`. It activates pnpm 12.3.4, installs GitHub CLI, installs Desktop Commander Remote, installs the workspace with the frozen lockfile, and installs the Playwright Chromium headless shell plus Linux dependencies.

The m3-ui devcontainer intentionally reuses the shared `giaokhoa_devcontainer_github-cli-config` Docker volume for GitHub CLI authentication, while Desktop Commander config/device state stays in m3-ui-specific volumes so remote devices remain isolated per devcontainer.

With VS Code and Dev Containers:

1. Clone and open the repository.
2. Run **Dev Containers: Reopen in Container**.
3. Let the post-create install complete.
4. Authenticate GitHub CLI once with `bash .devcontainer/scripts/setup-github-auth.sh`.
5. Pair the m3-ui Desktop Commander device once with `bash .devcontainer/scripts/setup-desktop-commander-auth.sh` and approve the OAuth device flow in the browser.
6. Reopen/restart the container as needed; the post-start hook will reuse the persisted m3-ui device credential and start the remote agent automatically.
7. Run `pnpm dev` or a package-level command above.

Do not copy `gh` or Desktop Commander credential files into the repository. GitHub CLI auth is shared through the persistent `giaokhoa_devcontainer_github-cli-config` volume; Desktop Commander credentials remain isolated in the m3-ui-specific device volume.

## Agent instructions

Repository agents start from [`AGENTS.md`](AGENTS.md). Material component/theme/token work uses `.agents/skills/material3-parity/SKILL.md`; token compiler work additionally uses `.agents/skills/style-dictionary/SKILL.md`.

The READMEs describe how the repository is structured and runs. Skills contain implementation decisions, audit procedures and forbidden patterns for agents.
