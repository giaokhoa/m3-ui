# Interaction adapters

This directory contains narrow adapters that translate web interaction state into Material component behavior when React Aria/native state alone is not sufficient.

Use this layer sparingly.

Preferred order:

1. native element behavior;
2. React Aria Components state/render props;
3. CSS data-attribute selectors;
4. a small internal interaction adapter only when the first three cannot express the required behavior.

Do not build a Compose-style `InteractionSource` clone. The goal is parity of Material states, not parity of Compose runtime machinery.

## Interaction ordering

`interactionOrder.ts` exists for the small piece of Compose behavior that plain boolean render props cannot represent: when hover, focus, and press interactions overlap, some Material defaults resolve the **most recently started interaction that is still active**.

RAC/native events remain the source of truth. The helper only maintains an ordered list supplied by components and exposes:

- start/end ordering;
- latest active interaction for elevation/shape/default resolution;
- latest visible hover/focus interaction for a Material state layer.

It intentionally does not own pointer, keyboard, touch, focus, selection, disabled, or form semantics.

Current consumers are Button, Card, and Chip. Their component-specific interaction modules remain thin aliases so local types/tests stay stable without duplicating the ordering algorithm.
