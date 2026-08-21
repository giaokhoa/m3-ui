# m3-ui

React component library monorepo built with Turborepo, TypeScript, plain CSS and React Aria Components.

## Workspace

- `packages/ui`: component library
- `apps/playground`: small Vite app for manual testing

## Commands

```bash
pnpm install
pnpm dev
pnpm build
pnpm typecheck
```

## Component convention

Each component lives in its own folder:

```text
packages/ui/src/components/Button/
├── Button.tsx
├── button.css
└── index.ts
```

Use React Aria Components for accessible behavior and plain CSS for styling.
