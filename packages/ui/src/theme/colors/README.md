# Color foundation

This directory owns Material color-scheme foundations and color-role runtime behavior.

Existing color implementation may be moved here incrementally when doing so improves cohesion. Do not churn working files only to satisfy the folder structure.

Responsibilities include:

- static Material 3 baseline schemes;
- dynamic source-color generation;
- `ColorScheme` role contracts;
- conversion of color roles to short CSS custom properties;
- color-related theme tests and source metadata.

Component-specific color defaults do not belong here. For example, the fact that a filled button uses `primary`/`onPrimary` belongs to button tokens/defaults, not the global color foundation.
