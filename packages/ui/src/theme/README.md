# Theme foundation architecture

The theme layer owns Material foundations that apply across component families. It is the web equivalent of the **theme-resolution** responsibility of Compose `MaterialTheme`; it is not a registry of per-component defaults and it is not a replacement for the canonical component-token graph.

Agents changing Material component/theme/token ownership must read `/.agents/skills/material3-parity/SKILL.md` first. Root `/AGENTS.md` defines the trigger scope for this mandatory entrypoint.

The ownership boundary is deliberate:

```text
canonical component token
    -> canonical system/color role
    -> CSS custom property endpoint
    -> ThemeProvider concrete runtime value
```

For example:

```text
component.button.variant.filled.containerColor
    -> color.role.primary
    -> var(--primary)
    -> ThemeProvider sourceColor-derived primary
```

Changing `sourceColor` must therefore update every color-bearing component through CSS inheritance/cascade. Components must not have to re-resolve their colors in React.

## Current color contract

`@m3-ui/ui` exposes Material 3 color roles as short, scoped CSS custom properties.

Examples:

- `primary` -> `--primary`
- `onPrimary` -> `--on-primary`
- `surfaceContainerHigh` -> `--surface-container-high`

There is intentionally no `--md-sys-` prefix.

`ThemeProvider` uses the official static Material 3 baseline when no `sourceColor` is provided. When `sourceColor` is provided, it uses Material Color Utilities `SchemeTonalSpot` to generate a dynamic scheme.

The static baseline is kept separate from dynamic generation because MCU output for a baseline-looking seed is not guaranteed to be byte-for-byte identical to the Material baseline used by the pinned Material references.

## Responsibilities

`ThemeProvider` may own:

- the active light/dark mode;
- a runtime `sourceColor` and contrast level;
- the concrete runtime `ColorScheme` values derived from those inputs;
- scoped system-role CSS variables such as `--primary`, `--surface`, and `--outline`;
- behavioral theme data that JavaScript genuinely needs;
- the matching themed portal scope.

`ThemeProvider` must **not** own:

- per-component semantic mappings such as "filled Button container uses Primary";
- a MUI-style `theme.components.Button` defaults/override registry;
- `ButtonDefaults.colors()`, `TextFieldDefaults.colors()`, or similar runtime facades whose only job is to return mappings already represented by canonical tokens;
- static component dimensions, typography, shape, state opacity, motion, or color mappings that Style Dictionary can compile once;
- React-time reserialization of immutable token data merely because Compose exposes a runtime `FooDefaults` API.

Those component semantics belong to canonical component DTCG and reviewed generated platform adapters.

## Why Compose `MaterialTheme` and `FooDefaults` do not map literally

Compose has both `MaterialTheme` and component `FooDefaults`. `FooDefaults` commonly reads the active `MaterialTheme` and resolves defaults at Compose runtime because Compose does not have the browser CSS cascade plus this repository's token compiler boundary.

On this web implementation, preserve the **Material semantic contract**, not the Kotlin mechanism:

```text
Compose runtime
MaterialTheme -> FooDefaults -> component

m3-ui web
canonical component DTCG -> generated CSS -> component
                         \
                          -> var(--role) -> ThemeProvider runtime value
```

Therefore Compose `FooDefaults` is an audit oracle for which semantic defaults, states, variants, sizes, and customization capabilities exist. Its presence is **not** evidence that m3-ui should create a TypeScript `FooDefaults` object or resolve static colors/defaults in React.

A component-local `*.defaults.ts` is valid only when it contains genuine runtime resolution. It must not become a handwritten token-to-CSS compiler.

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

Components should not call a theme hook just to obtain values that CSS can inherit. This is what keeps nested themes cheap and makes a `sourceColor` change propagate without component-specific React color work.

## Static baseline versus dynamic runtime theme

The long-term boundary is:

```text
immutable baseline Material foundations
    -> canonical DTCG
    -> Style Dictionary
    -> generated CSS / typed JS

dynamic sourceColor / runtime overrides
    -> ThemeProvider
    -> scoped CSS role overrides
```

The current implementation still keeps baseline light/dark color maps in `theme/baseline.ts` and statically serializes baseline role/typography variables through React. Treat that as **migration debt, not an architectural precedent**. Immutable baseline light/dark and baseline typography should be generated once when the token migration tracker reaches that work; `ThemeProvider` remains responsible for selecting the active mode and for injecting dynamic `sourceColor`/runtime overrides.

This optimization must not change the observable contract: changing `sourceColor`, mode, or contrast must still update all descendants and themed portals through the same system-role variables.

## React Context rule

Use React Context only for data that must be consumed by JavaScript. Do not make every component read colors, radii, typography, or other visual defaults from Context.

This keeps theme changes scoped, makes nested themes natural, reduces rerenders, and keeps component styling independent from React runtime state.

## Compose parity mapping

Compose `MaterialTheme` is the conceptual source for what belongs in this layer, not the implementation template.

Translate Compose mechanisms by responsibility:

- visual `CompositionLocal` values usually become CSS inheritance;
- JavaScript-required theme values may become typed Context values;
- `ColorScheme`, `Typography`, `Shapes`, and motion/elevation foundations define theme-level semantics;
- **static component-specific defaults belong to canonical component tokens and generated component adapters**;
- component-local TypeScript keeps only runtime behavior/arithmetic/history/DOM data or real runtime overrides.

The old wording "component-specific defaults stay with the component" must not be interpreted as "copy Compose `FooDefaults` into `Foo.defaults.ts`". It means component semantics do not leak into the global theme API; their immutable values stay in the component's canonical token namespace and generated adapter.

## Dependency rule

`theme/` may consume foundation/generated token data, but must not import public components. Public components may consume theme contracts and CSS variables.

The full repository ownership contract and static/runtime decision procedure live in `/docs/architecture/README.md`; token/compiler details live in `/packages/tokens/README.md`.
