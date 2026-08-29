# Menu architecture contract

Read this file before changing Menu surface layering, elevation rendering, clipping, overlay positioning, or React Aria menu semantics.

## Ownership

- React Aria `Popover` remains the positioning, flip/shift, dismissal and focus-restoration boundary.
- Menu's canonical container elevation remains `level2`. Generated `@m3-ui/tokens/elevation.css` serializes immutable shadow geometry and shared `<Elevation>` paints it.
- `.menu-surface` is the non-clipping elevation paint boundary inside the positioned Popover.
- `.menu-surface__clip` owns rounded clipping and the container background.
- `.menu` remains the React Aria menu and scroll surface; long-menu overflow stays on `.menu`.
- `getMenuStyle()` may project renderer geometry and existing token values into private CSS variables, but it must not serialize elevation geometry.
- Existing canonical Menu color-role strings are migration debt in the large upstream-derived token family; do not decode/rebuild them in React and do not add new direct runtime-role strings while that debt is migrated separately.

## Rendering contract

Both standard `Menu` and `ExposedMenu` must use the same `MenuSurface` paint/clip boundary. The Popover itself must stay non-clipping so the outer elevation shadow remains visible.

Component-internal wrappers and CSS layout may change to preserve this boundary. The separate shared UI layout workstream is outside this component migration.

Browser/visual tests inspect `.menu__elevation`, the actual paint layer, rather than requiring `.menu-popover` to own `box-shadow`.

The modular Menu stylesheet includes generated Elevation CSS and handwritten Elevation structural CSS before `menu.css`.

## Forbidden regressions

Do not call `getElevationBoxShadow()` from `Menu.defaults.ts` or emit `--_menu-shadow`; do not move rounded clipping back to `.menu-popover`; do not put `<Elevation>` inside a clipped surface; do not fork standard and exposed menu elevation structures; and do not move React Aria menu/Popover semantics onto decorative wrappers.

When this boundary changes, update this README and its executable architecture guard in the same PR.
