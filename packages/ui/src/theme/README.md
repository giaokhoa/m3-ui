# Theme runtime

`packages/ui/src/theme` contains the Material theme runtime used by `@m3-ui/ui`.

This README documents the current theme data flow and files. Agent decisions about token ownership, Compose parity and static-versus-runtime boundaries live in `.agents/skills/material3-parity/SKILL.md`.

## Runtime flow

Component semantic colors resolve through the canonical token graph to scoped CSS role variables owned by the active Material theme scope:

```text
component token
    -> canonical color role
    -> var(--role)
    -> generated baseline CSS or ThemeProvider runtime override
```

For example:

```text
component.button.variant.filled.containerColor
    -> color.role.primary
    -> var(--primary)
    -> active theme scope primary
```

A `sourceColor` change propagates to component styling through the provider scope and CSS cascade.

## ThemeProvider inputs

`ThemeProvider` currently accepts:

- `mode`: light or dark;
- `sourceColor`: optional Material dynamic-color seed;
- `contrastLevel`: dynamic scheme contrast input;
- `rippleFocus`: global Material ripple focus treatment;
- `style`: instance CSS/custom-property overrides.

When `sourceColor` is absent, the provider uses the canonical generated Material baseline scheme. When `sourceColor` is present, `createDynamicColorScheme()` uses Material Color Utilities `SchemeTonalSpot`.

## ThemeProvider outputs

The provider exposes two surfaces:

1. A scoped browser theme surface marked with `data-m3-theme` and `data-theme`. Generated `@m3-ui/tokens/theme.css` supplies static baseline role variables, default typography and `color-scheme`. Runtime dynamic colors and explicit instance overrides are emitted inline and therefore override the baseline declarations.

2. A typed React context for JavaScript consumers that need runtime theme information:

```ts
interface ThemeContextValue {
  mode: ThemeMode;
  sourceColor?: string;
  contrastLevel: number;
  rippleFocus: RippleFocusIndication;
  scheme: ColorScheme;
}
```

`useTheme()` returns that context. The baseline `ColorScheme` object is assembled from generated `@m3-ui/tokens` constants; it is a JavaScript view of canonical data rather than a second handwritten color table.

## Portal theming

Material overlays rendered through portals need the same scoped theme as ordinary descendants. `ThemeProvider` creates a themed portal container under `document.body` and exposes it through `ThemePortalContainerContext`.

The provider scope and portal scope receive the same `data-m3-theme`, `data-theme` and runtime override style object, so dialogs, menus, sheets and other portal surfaces resolve the same Material roles.

## Current files

```text
theme/
├── ThemeProvider.tsx          provider, context and themed portal scope
├── ThemePortalContext.ts      portal-container context
├── baseline.ts                generated-token ColorScheme JavaScript view
├── dynamic.ts                 Material Color Utilities dynamic scheme generation
├── cssVariables.ts            runtime ColorScheme -> scoped CSS role variables
├── types.ts                   ColorScheme / ThemeMode contracts
├── colors/                    color foundation helpers/data
├── typography/                type scale helpers/data
├── shapes/                    shape foundation
├── motion/                    motion foundation
├── elevation/                 elevation foundation
└── README.md
```

The package barrel in `theme/index.ts` exports the public theme contracts and helpers.

## Static baseline and dynamic schemes

The static baseline path is:

```text
packages/tokens/tokens/theme/baseline.json
    -> Style Dictionary
    -> generated tokens.js + theme.css
    -> ThemeProvider data-theme scope
```

The dynamic path is:

```text
sourceColor + mode + contrastLevel
    -> Material Color Utilities
    -> ColorScheme
    -> schemeToCssVariables()
    -> ThemeProvider inline role overrides
```

The same generated baseline token values also back `getBaselineColorScheme(mode)` for JavaScript consumers that need `useTheme().scheme` or the public baseline helpers.

## Typography

Default Material plain/brand font-family variables are serialized by generated `@m3-ui/tokens/theme.css` from canonical typeface tokens. The theme runtime no longer rebuilds those immutable variables through a React style object.

Public/docs typography consumers use the same generated Material type-scale data rather than a separate docs type system. Type-scale helpers remain under `theme/typography/` where JavaScript APIs actually need them.

## CSS consumption

The full UI build retains the generated theme adapter through the ThemeProvider import. The modular-style build additionally prepends the generated theme foundation to every self-contained `@m3-ui/ui/styles/*.css` component entry, preserving the modular consumption contract.

## Testing

Theme tests cover baseline scheme values, dynamic scheme generation, CSS-variable projection and the static-versus-dynamic ThemeProvider serialization boundary. Token tests cover the generated theme CSS itself.

Run them through the token/UI packages:

```bash
pnpm --filter @m3-ui/tokens test
pnpm --filter @m3-ui/ui test
pnpm --filter @m3-ui/ui typecheck
pnpm --filter @m3-ui/ui build
```

Visual behavior of theme-sensitive components is additionally covered through Storybook/Playwright visual regression.

## Related docs

- Token/compiler data flow: `packages/tokens/README.md`
- Ripple runtime: `packages/ui/src/internal/ripple/README.md`
- Elevation runtime: `packages/ui/src/internal/elevation/README.md`
- Repository overview and commands: root `README.md`

For agent implementation work, root `AGENTS.md` selects the required Material parity/compiler skills.
