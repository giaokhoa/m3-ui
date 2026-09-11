# Typography foundation

This directory owns Material typography roles and their CSS/runtime representation.

Current responsibilities:

- map Material reference typeface roles such as `plain` and `brand` to CSS variables;
- expose the canonical Material type scale (`display`, `headline`, `title`, `body`, and `label`) as reusable CSS-ready styles;
- expose the corresponding Material 3 Expressive emphasized type styles without inventing a parallel scale;
- apply the default Material typeface through `ThemeProvider` so components inherit typography from the theme boundary;
- keep component typography tied to roles rather than hardcoded font-family names;
- preserve upstream size, line-height, weight, tracking, and font-family semantics where they are meaningful on the web.

The default web typeface is Roboto. `ThemeProvider` renders the Material default Roboto 400/500/700 stylesheet and emits `--font-family-plain` and `--font-family-brand`, applying the plain role to its root. React 19 hoists and de-duplicates the stylesheet link, including during SSR. Consumers may override the CSS variables through the provider `style` prop without changing component implementations.

`getMaterialTypeStyle(role, emphasis)` projects the generated `@m3-ui/tokens` values into CSS-ready properties. It does not duplicate token values or introduce global CSS variables for static typography metrics. This makes the same Material type contract available to app-owned prose surfaces, documentation content, and other semantic HTML without adding non-Material `Typography`, `Prose`, or heading components to `@m3-ui/ui`.

## Boundary with layout and documentation

Typography owns text appearance only. It must not introduce breakpoints, content widths, pane placement, navigation structure, or responsive layout policy. Documentation applications should compose the existing public Material navigation/layout components and the dedicated `@m3-ui/ui/layout` subsystem rather than implementing a second adaptive-layout model in the theme layer.

Documentation-only constructs such as code blocks, callouts, heading anchors, API tables, and Markdown prose wrappers belong to the documentation application. They may consume `getMaterialTypeStyle()` and public Material components, but they are not Material component families and must not be promoted into the core UI package solely for a docs framework.

Do not put component-specific text decisions here. A button choosing `labelLarge` belongs to button tokens/defaults; the definition of `labelLarge` belongs in the typography foundation.
