# Focus ring primitive

This directory will hold shared focus-visible styling/geometry when Material components need behavior beyond a simple component-local outline.

Responsibilities may include:

- shared focus-ring thickness/offset/radius conventions;
- high-contrast-safe focus visibility;
- coordination with component clipping and state layers;
- reusable CSS variables for components that share the same focus treatment.

Use `data-focus-visible`/browser focus-visible semantics rather than treating every focus event as keyboard focus.

Do not hide native focus without replacing it with an equally or more visible accessible indicator.
