# Public components

Each public Material component family lives in its own folder.

The public layer should stay small and idiomatic for React/TypeScript. It owns public props, public defaults, variant composition, exports, and component-local CSS. Large state/layout helpers belong in a component-local `internal/` folder or the shared `src/internal/` layer when multiple component families need them.

## Preferred component structure

Simple component:

```text
Button/
├── Button.tsx
├── Button.types.ts
├── Button.defaults.ts
├── button.css
├── index.ts
└── README.md        # optional parity notes
```

Complex family:

```text
TextField/
├── TextField.tsx
├── OutlinedTextField.tsx
├── TextField.types.ts
├── TextField.defaults.ts
├── text-field.css
├── internal/
│   ├── TextFieldLayout.tsx
│   └── ...
└── index.ts
```

Do not create every file mechanically. Use only the files a component actually needs.

## Public API rules

Public APIs should preserve Material concepts and variant structure while following React/React Aria conventions.

Prefer:

- `isDisabled` over a negated `enabled` prop;
- `isSelected` for controlled selection state;
- `onPress` when delegating to React Aria press semantics;
- `ReactNode`/typed render props for content;
- discriminated unions when prop combinations are mutually exclusive;
- plain object overrides for colors/shapes/elevation/defaults.

Do not expose Kotlin implementation concepts such as `Modifier`, `InteractionSource`, `Dp`, `Color.Unspecified`, companion objects, or `.copy()` methods.

## Defaults and tokens

A component should keep the distinction between generated tokens and public defaults:

```text
generated token data
        ↓
component defaults
        ↓
state/style resolution
        ↓
public component
```

Generated token tables must not be duplicated inside `*.tsx` files.

## React Aria / native semantics

Use the strongest semantic primitive available:

- Button family → React Aria Button/native button semantics;
- Checkbox → React Aria Checkbox;
- TextField → React Aria TextField composition;
- link-like components → links, not clickable generic containers.

Material behavior is layered on top of correct web semantics.

## Styling

Purely visual interaction state should generally be resolved through CSS using React Aria data attributes.

Examples:

```text
data-hovered
data-pressed
data-focus-visible
data-disabled
data-selected
data-indeterminate
data-invalid
```

Avoid storing hover/press/focus in React state only to select colors or elevations.

## Parity notes

For non-trivial ports, add a component README or parity test documentation that records:

- AndroidX source files;
- pinned source revision;
- generated token source file(s);
- relevant upstream tests;
- supported variants/states;
- intentional web differences.
