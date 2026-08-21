# Elevation foundation

This directory will own Material elevation levels and their web rendering strategy.

Responsibilities:

- define typed elevation levels used by generated component tokens;
- map Material elevation semantics to CSS shadows and any required surface-tint behavior;
- keep state-driven elevation values reusable across components;
- document differences between Compose tonal elevation and web shadow/elevation rendering.

Component-specific elevation state tables belong with component tokens/defaults. This layer only defines the shared meaning of elevation levels and how they render on the web.
