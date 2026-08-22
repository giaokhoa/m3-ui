# Internal primitives

This directory contains reusable implementation details shared by public components but intentionally excluded from the public package API. Internal primitives exist to keep component implementations small and avoid duplicating Material behavior across families; they are not a second component library.

## Token boundary

Immutable Material values come from the generated `@m3/tokens` package root. Internal primitives consume generated values directly unless a local projection is genuinely needed for runtime behavior.

`ThemeProvider` owns runtime/theme-dependent values such as dynamic color roles. Generated component color values resolve to those theme CSS variables, while dimensions, motion, elevation geometry, opacity, and other immutable values remain generated static values.

A conversion such as CSS `px`/`ms` → number is allowed only at a JavaScript arithmetic/timer boundary and belongs in narrow UI runtime helpers such as `tokenValues.ts`; it must not become a second design-token table.

## Rules

- Nothing under `internal/` is a stable public API unless deliberately promoted later.
- Prefer narrow primitives over generic mega-abstractions.
- Do not reproduce Compose call graphs mechanically.
- Use native HTML and React Aria semantics before inventing interaction infrastructure.
- React Aria remains the source of press/hover/focus behavior; primitives consume its state/events rather than attaching competing interaction hooks.
- Keep visual state in CSS when possible.
- Internal modules may consume generated `@m3/tokens` values and theme CSS variables but must not import a public component merely to reuse behavior.
- Do not reintroduce token-package compatibility facades just to recover ergonomic object shapes; project generated values where they are actually consumed.

## Extraction threshold

Create an internal primitive only when at least one of these is true: multiple public components share the behavior; a complex component benefits from separating layout/decoration/state logic; the primitive directly corresponds to a stable Material concept such as state layer or elevation rendering; or isolating the behavior makes parity testing substantially clearer.

Do not extract helpers solely to mirror an AndroidX internal class name.
