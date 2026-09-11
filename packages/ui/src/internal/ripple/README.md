# Ripple implementation

Repository policy for Material interaction ownership lives in `.agents/skills/material3-parity/SKILL.md`. Read that skill before changing this subsystem. This README describes the current implementation and execution path only.

## Structure

- `useRipple.ts` — measured wave geometry, active-wave identity, minimum press lifetime, release scheduling, cleanup, and RAC-friendly press-handler chaining.
- `Ripple.tsx` — state-layer/focus/wave paint DOM and runtime geometry variables.
- `geometry.ts` — wave geometry calculations from normalized press coordinates and bounds.
- `ripple.css` — handwritten structure/animations.
- `@m3-ui/tokens/ripple.css` — Style Dictionary generated immutable opacity/motion/focus-ring bindings.

## RAC-backed interaction flow

Current hover/focus-visible state comes from the RAC render state:

```text
RAC render state
    -> <Ripple state={...} />
    -> state-layer / focus indication
```

Press waves use RAC's normalized press event:

```text
RAC onPressStart/onPressEnd
    -> useRipple().getPressProps(...)
    -> measured wave geometry + lifecycle
    -> <Ripple controller={...} />
```

`getPressProps()` chains Ripple lifecycle with caller handlers so a RAC-backed component does not manually invoke Ripple and then repeat the user's handler. Ripple indication state is supplied only through the normalized `state` prop; the former `stateInteraction`, `isHovered`, and `isFocusVisible` compatibility props are not part of the contract.

## Native and special adapters

`RippleController.onPressStart/onPressEnd` remains a narrow adapter surface for hosts that do not have a RAC normalized PressEvent or that must preserve host-owned DOM coordinates/lifecycle. Audited examples are Card, BottomSheet, DragHandle, Surface, and the DatePicker calendar-cell DOM adapter.

Those hosts keep pointer/keyboard/nested-interactive semantics at the component boundary and only translate an already-owned interaction into Ripple geometry/lifecycle. Shared Ripple must not grow a generic native pointer/keyboard engine or a second interaction state machine.

## Runtime ownership

Runtime values include:

- wave start/target coordinates;
- diameter/start scale derived from measured bounds;
- active/releasing wave lifecycle and timers;
- component-specific focus-ring radius/inset;
- current RAC/native-adapter hover/focus-visible state;
- the theme-level `rippleFocus` choice.

Immutable state-layer opacity, timings/easings, focus-ring stroke/inset/color and motion bindings come from generated token CSS.

## Paint and theme

When a host does not set `--ripple-color`, Ripple uses inherited `currentColor`. Focus-ring role colors resolve through canonical Material color roles and ThemeProvider-owned runtime role variables.

The generated platform adapter is emitted at:

```text
packages/tokens/dist/generated/ripple.css
```

Public modular UI styles that render Ripple inline the generated adapter before handwritten Ripple CSS.

## Focus geometry

The Ripple host may span the interaction/state-layer slot while focus indication uses smaller component-specific bounds. Checkbox and RadioButton therefore pass token-derived `focusRingInset`/radius values; Button follows its current visual container radius.

`ThemeProvider rippleFocus="inset-ring"` selects the inset-ring path. The default remains the opacity focus indication. Forced-colors mode leaves component/system focus affordances authoritative.

## Pinned AndroidX baseline

Repository ripple/focus geometry is audited against the pinned AndroidX Material3 revision recorded by the token/audit package. Existing canonical values include the reviewed inset focus-ring widths/insets and sampled motion curves.

## Validation

Relevant checks cover:

1. normalized press-event coordinates and wave geometry;
2. minimum press lifetime/release cleanup;
3. chained caller press handlers;
4. RAC/native-adapter hover/focus-visible state-layer behavior;
5. generated Ripple token bindings and modular CSS order;
6. focus-ring geometry for compact selection controls;
7. unit/type/build and Chromium visual regression.
