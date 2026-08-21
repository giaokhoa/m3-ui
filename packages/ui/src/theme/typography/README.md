# Typography foundation

This directory owns Material typography roles and their CSS/runtime representation.

Current responsibilities:

- map Material reference typeface roles such as `plain` and `brand` to CSS variables;
- apply the default Material typeface through `ThemeProvider` so components inherit typography from the theme boundary;
- keep component typography tied to roles rather than hardcoded font-family names;
- preserve upstream size, line-height, weight, tracking, and font-family semantics where they are meaningful on the web.

The default web typeface is Roboto. `ThemeProvider` renders the Material default Roboto 400/500/700 stylesheet and emits `--font-family-plain` and `--font-family-brand`, applying the plain role to its root. React 19 hoists and de-duplicates the stylesheet link, including during SSR. Consumers may override the CSS variables through the provider `style` prop without changing component implementations.

Do not put component-specific text decisions here. A button choosing `labelLarge` belongs to button tokens/defaults; the definition of `labelLarge` belongs in the typography foundation.
