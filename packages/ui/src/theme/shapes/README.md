# Shape foundation

This directory will own Material shape roles and conversion to CSS geometry.

Responsibilities:

- define typed Material shape keys;
- map upstream corner sizes to CSS border-radius values;
- support component defaults that reference shape roles instead of hardcoded radii;
- document web-specific representation of asymmetric or full/pill shapes;
- keep shape data independent from React components.

Do not create wrapper classes that imitate Compose `Shape`. Prefer plain immutable TypeScript data and CSS-friendly values.
