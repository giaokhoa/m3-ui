# Interaction adapters

This directory is reserved for narrow adapters that translate web interaction state into Material component behavior when React Aria/native state alone is not sufficient.

Use this layer sparingly.

Preferred order:

1. native element behavior;
2. React Aria Components state/render props;
3. CSS data-attribute selectors;
4. a small internal interaction adapter only when the first three cannot express the required behavior.

Do not build a Compose-style `InteractionSource` clone. The goal is parity of Material states, not parity of Compose runtime machinery.

Any adapter added here must document:

- which upstream Compose behavior it represents;
- why native/RAC state is insufficient;
- which public components consume it;
- how keyboard, pointer, touch, and focus semantics are preserved.
