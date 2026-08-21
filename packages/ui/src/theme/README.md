# Theme foundation architecture

The theme layer owns Material foundations that apply across component families.

Existing color theming already lives here. Compose parity work should extend this layer for typography, shapes, motion, and elevation without moving component-specific behavior into the global theme.

## Current color contract

`@m3/ui` exposes Material 3 color roles as short, scoped CSS custom properties.

Examples:

- `primary` -> `--primary`
- `onPrimary` -> `--on-primary`
- `surfaceContainerHigh` -> `--surface-container-high`

There is intentionally no `--md-sys-` prefix.

`ThemeProvider` uses the official static Material 3 baseline when no `sourceColor` is provided. When `sourceColor` is provided, it uses Material Color Utilities `SchemeTonalSpot` to generate a dynamic scheme.

The static baseline is kept separate from dynamic generation because MCU output for a baseline-looking seed is not guaranteed to be byte-for-byte identical to the generated Material Web / Jetpack Compose baseline token sets.

## Responsibilities

- define public theme contracts;
- scope system-level CSS custom properties;
- expose JavaScript theme values only when JavaScript genuinely needs them;
- translate generated foundation tokens into reusable runtime values;
- keep light/dark/dynamic color behavior separate from component defaults;
- provide the shared Material foundations consumed by component defaults.

## Planned structure

```text
theme/
├── colors/
├── typography/
├── shapes/
├── motion/
├── elevation/
└── README.md
```

Each foundation gets a directory when there is a concrete implementation need. Until then, documentation files reserve the architecture without inventing premature abstractions.

## CSS-first rule

Visual theme values should flow through CSS whenever possible.

Colors already use system variables such as:

```text
--primary
--on-primary
--surface
--surface-container-high
--outline
--error
```

Typography, shape, motion, and elevation may use similarly clear system variables when runtime theme switching benefits from CSS inheritance.

Components should not call a theme hook just to obtain values that CSS can inherit.

## React Context rule

Use React Context only for data that must be consumed by JavaScript. Do not make every component read colors, radii, or typography from Context.

This keeps theme changes scoped, makes nested themes natural, reduces rerenders, and keeps component styling independent from React runtime state.

## Compose parity

Compose `MaterialTheme` is the conceptual source for what belongs in this layer, not the implementation template.

Translate Compose mechanisms by responsibility:

- visual `CompositionLocal` values usually become CSS inheritance;
- JavaScript-required theme values may become typed Context values;
- `ColorScheme`, `Typography`, `Shapes`, and motion/elevation foundations become plain TypeScript contracts and CSS-facing values;
- component-specific defaults stay with the component rather than leaking into the global theme.

## Dependency rule

`theme/` may consume foundation/generated token data, but must not import public components. Public components may consume theme contracts and CSS variables.
