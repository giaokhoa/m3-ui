# ListItem implementation notes

Read this file before changing ListItem token ownership, elevation painting, interaction-state projection, or DOM structure.

## Material elevation semantics

ListItem has two canonical semantic elevation states:

- normal: `component.list.base.itemContainerElevation` (`level0`);
- dragged: `component.list.base.itemDraggedContainerElevation` (`level4`).

Runtime interaction code may choose between those semantic levels, while immutable Material shadow geometry remains compiler-owned rather than being serialized in TypeScript.

Dragged state is the state that changes ListItem elevation. `getListItemElevationLevel()` currently selects normal versus dragged elevation.

## Current web rendering

The current ListItem root owns `overflow: hidden` so its expressive shape clips state-layer/content paint. A child shadow painter inside that clipped root would not render the outer shadow correctly, so the current implementation paints the generated elevation recipe on the root using `.elevation-host` and `data-elevation`.

That host choice is an implementation detail. A future implementation may use another paint boundary or DOM arrangement if it preserves the same `level0`/`level4` semantics, shape clipping, geometry, interaction states, selection semantics, ripple behavior, accessibility, and RTL behavior.

`@m3-ui/tokens/elevation.css` owns the immutable level recipe, shared elevation CSS applies it, and `ThemeProvider` owns the concrete `--shadow` role.

## Interaction and token ownership

Hover, focus, press, selection, disabled state, dragged shape selection, content colors, ripple state, and keyboard/selection semantics remain runtime behavior.

The current `component.list.base` direct color-role strings are pre-existing semantic-token migration debt. This elevation work does not decode or reconstruct those runtime role expressions in React. A later reviewed token migration can replace them with `color.role.*` aliases independently.

## CSS packaging

Source/dev and modular style consumers currently include generated elevation CSS and shared elevation paint CSS before `list-item.css`. Generated shadow geometry remains centralized under token build output rather than copied into component CSS.

## Validation

Tests should cover the observable behavior:

- normal/selected items select semantic `level0` and compute no shadow;
- dragged items select canonical `level4` and compute the generated shadow;
- existing 56/72/88 geometry, slot placement, expressive shape clipping, selection semantics, ripple behavior, keyboard behavior, and RTL behavior remain correct.

Do not add a source-regex guard for `.elevation-host`, wrapper names, root paint ownership, or a particular DOM hierarchy. If the paint implementation changes, update these notes and validate the resulting Material behavior directly.
