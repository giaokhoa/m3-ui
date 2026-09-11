# Motion foundation

This directory will own Material motion tokens and their web representation.

Responsibilities:

- define typed duration and easing roles;
- map Material/Compose motion scheme values to CSS transition/animation values;
- provide shared motion values used by component defaults;
- centralize reduced-motion behavior where a component needs adaptation;
- document cases where browser animation behavior differs from Compose.

Prefer CSS transitions/animations for purely visual motion. Use JavaScript animation state only when layout measurement or interaction behavior requires it.

Do not port Compose animation APIs literally. Preserve timing/easing semantics while using idiomatic web mechanisms.
