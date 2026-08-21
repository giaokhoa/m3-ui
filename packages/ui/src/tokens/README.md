# Token layer

This directory contains Material token data used by `m3-ui`.

Tokens are not component implementations. They describe Material values and references such as color roles, dimensions, shape keys, typography keys, elevation levels, state-layer opacity, and motion references.

## Responsibilities

- represent upstream Material 3 token data in TypeScript-friendly structures;
- keep generated token data separate from handwritten component code;
- provide stable, typed contracts consumed by theme/default layers;
- make upstream drift reviewable and testable.

## Non-responsibilities

Do not put these here:

- React components;
- hooks;
- DOM APIs;
- React Aria logic;
- component state machines;
- CSS files;
- handwritten visual overrides that are not part of the Material token source.

## Structure

```text
tokens/
├── generated/
│   └── README.md
└── README.md
```

The initial structure is intentionally small. Add handwritten token-domain modules only when a real implementation needs them.

## Generated token policy

Generated files under `generated/` must be reproducible from a pinned AndroidX Material3 revision. They should be treated as build artifacts checked into source control for reviewability.

A generated file should include enough metadata to trace it to upstream, for example the AndroidX commit SHA and source Kotlin token file.

## TypeScript representation

Prefer plain immutable data:

```ts
export const checkboxTokens = {
  containerSize: 18,
  selectedContainerColor: 'primary',
  selectedIconColor: 'onPrimary',
} as const satisfies CheckboxTokenSet;
```

Prefer literal unions/typed keys over Kotlin-style enums when the domain is naturally represented by property names.

Generated data should not expose Compose implementation concepts such as `Dp`, `ColorSchemeKeyTokens`, or Kotlin object singletons directly. Convert those concepts into TypeScript-native values at generation time while preserving the semantic information.

## Dependency rule

This layer may depend on type-only foundation contracts when necessary, but it must not depend on `components/` or `internal/`.
