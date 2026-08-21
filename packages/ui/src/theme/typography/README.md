# Typography foundation

This directory will own Material typography roles and their CSS/runtime representation.

Planned responsibilities:

- map Compose/Material typography keys such as `labelLarge`, `bodyMedium`, and `headlineSmall` to typed TypeScript roles;
- define the default Material type scale used by component defaults;
- expose CSS variables or shared declarations where runtime theme changes require inheritance;
- preserve upstream size, line-height, weight, tracking, and font-family semantics where they are meaningful on the web;
- document intentional differences caused by browser font metrics.

Do not put component-specific text decisions here. A button choosing `labelLarge` belongs to button tokens/defaults; the definition of `labelLarge` belongs here.
