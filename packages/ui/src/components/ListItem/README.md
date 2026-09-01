# ListItem implementation notes

Read this file before changing ListItem token ownership, elevation painting, interaction-state projection, or DOM structure.

## Material elevation semantics

ListItem has two canonical semantic elevation states:

- normal: `component.list.base.itemContainerElevation` (`level0`);
- dragged: `component.list.base.itemDraggedContainerElevation` (`level4`).

This semantic choice genuinely depends on the live `isDragged` prop, so `ListItem.elevation.ts` remains a narrow runtime bridge. Immutable shadow geometry and opacity remain compiler-owned in generated elevation CSS.

## Current web rendering

The ListItem root owns `overflow: hidden` so its expressive shape clips state-layer/content paint. A child shadow painter inside that clipped root would not render the outer shadow correctly, so the implementation paints the generated elevation recipe on the root using `.elevation-host` and `data-elevation`.

That host choice is an implementation detail. A future implementation may use another paint boundary or DOM arrangement if it preserves the same `level0`/`level4` semantics, shape clipping, geometry, interaction states, selection semantics, ripple behavior, accessibility, and RTL behavior.

`@m3-ui/tokens/elevation.css` owns the immutable level recipe, shared elevation CSS applies it, and `ThemeProvider` owns the concrete `--shadow` role.

## Static state and token ownership

Canonical `component.list.base` tokens own immutable ListItem spacing, one/two/three-line heights, semantic colors, content opacity, shapes, typography, focus indicator values, and state/motion mappings. Color-bearing tokens consumed by ListItem alias canonical `color.role.*` endpoints so `ThemeProvider sourceColor` flows through normal CSS inheritance.

`@m3-ui/tokens/list-item.css` is the reviewed Style Dictionary adapter. It owns the private variable bindings and CSS-expressible state selectors for:

- one/two/three-line minimum heights;
- base, selected, disabled and selected-disabled paint;
- hovered, focus-visible, pressed and dragged shapes;
- selected interaction content colors;
- typography, focus indicator, FastSpatial shape motion, and Ripple state-layer color/opacity.

React Aria remains the source of truth for hover, focus-visible, press and disabled state. The component does not mirror those states into a TypeScript color/shape resolver. `data-selected`, `data-dragged`, line count and the narrow elevation level are component semantics layered onto the RAC host.

## Ripple boundary

Interactive ListItems continue to use the shared RAC Ripple contract: RAC current render state drives hover/focus indication and normalized PressEvents drive runtime wave geometry/lifecycle. Generated ListItem CSS only supplies immutable Ripple color/state opacity bindings; it does not add another interaction engine.

## CSS packaging

Source/dev and modular style consumers include generated elevation and ListItem CSS before handwritten structural CSS. Handwritten `list-item.css` owns layout, clipping, slot placement, focus outline application and reduced-motion structure; it does not restate immutable Material defaults.

## Validation

Tests should cover the observable behavior:

- generated CSS maps canonical 56/72/88 geometry, typography, state colors/opacities, shapes and motion;
- normal/selected items select semantic `level0` and dragged items select canonical `level4`;
- selected/disabled/hover/focus/press/dragged visuals preserve Material behavior and state precedence;
- dynamic `sourceColor` updates ListItem paint through semantic role CSS variables;
- selection semantics, ripple behavior, keyboard behavior, user style overrides and RTL behavior remain correct.

Do not add a source-regex guard for `.elevation-host`, wrapper names, root paint ownership, or a particular DOM hierarchy. If the paint implementation changes, update these notes and validate the resulting Material behavior directly.
