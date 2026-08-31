# Theme runtime

`packages/ui/src/theme` contains the Material theme runtime used by `@m3-ui/ui`.

This README documents the current theme data flow and files. Agent decisions about token ownership, Compose parity and static-versus-runtime boundaries live in `.agents/skills/material3-parity/SKILL.md`.

## Runtime flow

Component semantic colors resolve through the canonical token graph to scoped CSS role variables owned by `ThemeProvider`:

```text
component token
    -> canonical color role
    -> var(--role)
    -> ThemeProvider concrete runtime value
```

For example:

```text
component.button.variant.filled.containerColor
    -> color.role.primary
    -> var(--primary)
    -> ThemeProvider primary
```

A `sourceColor` change therefore propagates to component styling through the provider scope and CSS cascade.

## ThemeProvider inputs

`ThemeProvider` currently accepts:

- `mode`: light or dark;
- `sourceColor`: optional Material dynamic-color seed;
- `contrastLevel`: dynamic scheme contrast input;
- `rippleFocus`: global Material ripple focus treatment;
- `style`: instance CSS/custom-property overrides.

When `sourceColor` is absent, the current implementation loads the repository's static baseline light/dark `ColorScheme`. When `sourceColor` is present, `createDynamicColorScheme()` uses Material Color Utilities `SchemeTonalSpot`.

## ThemeProvider outputs

The provider exposes two surfaces:

1. Scoped CSS custom properties for Material system roles such as:

```text
--primary
--on-primary
--surface
--surface-container-high
--outline
--error
--shadow
```

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

`useTheme()` returns that context.

## Portal theming

Material overlays rendered through portals need the same scoped theme as ordinary descendants. `ThemeProvider` creates a themed portal container under `document.body` and exposes it through `ThemePortalContainerContext`.

The provider scope and portal scope receive the same `data-theme` and CSS-variable style object, so dialogs, menus, sheets and other portal surfaces resolve the same Material roles.

## Current files

```text
theme/
├── ThemeProvider.tsx          provider, context and themed portal scope
├── ThemePortalContext.ts      portal-container context
├── baseline.ts                current static Material baseline schemes
├── dynamic.ts                 Material Color Utilities dynamic scheme generation
├── cssVariables.ts            ColorScheme -> scoped CSS role variables
├── types.ts                   ColorScheme / ThemeMode contracts
├── colors/                    color foundation helpers/data
├── typography/                type scale and current typography theme projection
├── shapes/                    shape foundation
├── motion/                    motion foundation
├── elevation/                 elevation foundation
└── README.md
```

The package barrel in `theme/index.ts` exports the public theme contracts and helpers.

## Static baseline and dynamic schemes

The current baseline path is:

```text
baseline.ts
    -> getBaselineColorScheme(mode)
    -> schemeToCssVariables()
    -> ThemeProvider style
```

The current dynamic path is:

```text
sourceColor + mode + contrastLevel
    -> Material Color Utilities
    -> ColorScheme
    -> schemeToCssVariables()
    -> ThemeProvider style
```

Issue #150 tracks moving immutable baseline color/typography data into the canonical token/compiler pipeline while preserving the same public runtime behavior.

## Typography

The theme runtime currently applies the default Material typography foundation together with the color scheme. Public/docs typography consumers use the same generated Material type-scale data rather than a separate docs type system.

The current typography implementation lives under `theme/typography/`.

## Testing

Theme tests cover baseline scheme values, dynamic scheme generation and CSS-variable projection. Run them through the UI package:

```bash
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
