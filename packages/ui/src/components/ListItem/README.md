# ListItem architecture contract

Read this file before changing ListItem token ownership, elevation painting, interaction-state projection, or DOM structure.

## Elevation boundary

ListItem has two canonical semantic elevation states:

- normal: `component.list.base.itemContainerElevation` (`level0`);
- dragged: `component.list.base.itemDraggedContainerElevation` (`level4`).

Runtime interaction code may choose between those semantic levels, but it must not serialize Material shadow geometry in TypeScript.

The ListItem root deliberately uses the shared `.elevation-host` paint mode instead of a descendant `<Elevation>` element. The root already owns `overflow: hidden` so its animated expressive shape clips the state layer and content correctly. A descendant shadow painter would be clipped by that overflow, while adding a wrapper solely for elevation would change the existing DOM/geometry contract.

Therefore the root keeps its existing element and receives:

```text
class="list-item elevation-host"
data-elevation="level0|level4"
```

`@m3-ui/tokens/elevation.css` owns the immutable level recipe, `internal/elevation/elevation.css` applies the shared host `box-shadow`, and `ThemeProvider` continues to own the concrete `--shadow` role value.

`ListItem.defaults.ts` must not call `getElevationBoxShadow()` or emit `--_list-item-box-shadow`.

## Interaction ownership

ListItem interaction state remains runtime behavior. Hover, focus, press, selection, disabled, dragged shape selection, content colors, ripple state and keyboard/selection semantics are not static CSS-token compilation problems and may remain in React/TypeScript.

Dragged state is the only state that changes the ListItem elevation level. `getListItemElevationLevel()` is the single runtime selector for normal versus dragged semantic elevation.

## CSS packaging

`ListItem.tsx` imports the reviewed generated elevation adapter and shared elevation paint CSS before `list-item.css` so source/dev consumers receive the host recipe.

The modular `@m3-ui/ui/styles/ListItem.css` path must also inline, in order:

1. `packages/tokens/dist/generated/elevation.css`;
2. `packages/ui/src/internal/elevation/elevation.css`;
3. `packages/ui/src/components/ListItem/list-item.css`.

Do not copy the generated recipe into `list-item.css`.

## Browser contract

Browser tests inspect the actual host paint element: the ListItem root itself, because this component intentionally uses `.elevation-host`.

They must verify:

- normal/selected items expose `data-elevation="level0"` and compute `box-shadow: none`;
- dragged items expose `data-elevation="level4"` and compute a non-`none` shadow;
- existing 56/72/88 geometry, slot placement, selection semantics, ripple behavior and RTL behavior remain unchanged.

## Token migration boundary

The current `component.list.base` color-role strings are pre-existing semantic-token migration debt. This elevation migration does not decode or rewrite those runtime role expressions in React. A later semantic-color migration should convert the canonical DTCG color values to `color.role.*` aliases as one reviewed token change, without coupling that sweep to elevation painting.

## Forbidden regressions

Do not:

- restore `getElevationBoxShadow()` or a private ListItem shadow string;
- hardcode level4 shadow geometry/opacities in ListItem CSS or TypeScript;
- add a child elevation painter inside the clipped root;
- add a wrapper solely to paint elevation;
- add positioning, sizing, overflow or transform behavior through `.elevation-host`;
- change ListItem line geometry, selection semantics, ripple behavior or DOM hierarchy as part of an elevation/token refactor;
- treat the existing direct List color-role strings as permission to decode `var(--role)` values in runtime code.
