# m3-ui

React component library monorepo built with Turborepo, TypeScript, plain CSS and React Aria Components.

## Workspace

- `packages/ui`: component library
- `apps/playground`: small Vite app for manual testing
- `docs/architecture`: Compose-to-TypeScript parity architecture and porting rules
- `scripts/compose-sync`: reserved tooling contract for syncing generated Material token data

## Commands

```bash
pnpm install
pnpm dev
pnpm test
pnpm build
pnpm typecheck
```

## Architecture before implementation

Read [`docs/architecture/README.md`](docs/architecture/README.md) before porting a Material 3 component from Jetpack Compose.

The project targets 1:1 parity in Material behavior, tokens, defaults, states, layout, and accessibility where those concepts apply to the web. It does **not** translate Kotlin/Compose runtime code line by line.

Key rules:

- AndroidX Material3 is pinned as a source of truth for parity work.
- Generated token data and handwritten React implementation are separate layers.
- TypeScript must remain idiomatic; do not recreate `Modifier`, Kotlin `data class`, `.copy()`, `Dp`, or `InteractionSource` APIs.
- Native HTML and React Aria Components provide web semantics and interaction state.
- Visual state should be CSS-first when possible.
- Parity is proven by independent token/default/behavior/layout tests.

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
