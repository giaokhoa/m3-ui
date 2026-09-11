# State layer primitive

This directory will hold reusable Material state-layer behavior for hover, focus, press, drag, and related visual states.

The implementation should be CSS-first and driven by native/React Aria state attributes whenever possible.

Expected inputs are Material token values such as:

- state-layer color role;
- hover opacity;
- focus opacity;
- pressed opacity;
- shape/clip behavior.

Do not mirror `MutableInteractionSource` into a custom JavaScript interaction system. If React Aria already exposes `data-hovered`, `data-pressed`, `data-focus-visible`, or equivalent state, consume those attributes directly in CSS.

The primitive may provide shared CSS variables or utility styles, but should stay narrow enough that components can preserve their own semantics and layout.
