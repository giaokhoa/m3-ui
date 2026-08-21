# Internal primitives

This directory contains reusable implementation details shared by public components but intentionally excluded from the public package API.

Internal primitives exist to keep component implementations small and to avoid duplicating Material behavior across families. They are not a second component library.

## Planned structure

```text
internal/
├── surface/
├── state-layer/
├── interactions/
├── focus-ring/
├── text-field/
└── README.md
```

## Rules

- Nothing under `internal/` is a stable public API unless deliberately promoted later.
- Prefer narrow primitives over generic mega-abstractions.
- Do not reproduce Compose call graphs mechanically.
- Use native HTML and React Aria semantics before inventing interaction infrastructure.
- Keep visual state in CSS when possible.
- Internal modules may consume theme/token layers but must not import a public component merely to reuse behavior.

## Extraction threshold

Create an internal primitive only when at least one of these is true:

- multiple public components share the behavior;
- a complex component benefits from separating layout/decoration/state logic;
- the primitive directly corresponds to a stable Material concept such as state layer or elevation rendering;
- isolating the behavior makes parity testing substantially clearer.

Do not extract helpers solely to mirror an AndroidX internal class name.
