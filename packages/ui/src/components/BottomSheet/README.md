# BottomSheet implementation notes

Read this file before changing BottomSheet token ownership, elevation painting, sheet geometry, anchors, gestures, or modal lifecycle.

## Material elevation semantics

BottomSheet uses **shadow elevation**, not the BottomAppBar tonal-elevation model. The pinned AndroidX source exposes `sheetShadowElevation` and passes it to `Surface.shadowElevation`.

The canonical sheet tokens currently map both standard and modal containers to `level1`. Runtime code may select the semantic standard/modal level, while immutable shadow geometry remains compiler-owned rather than being rebuilt in TypeScript.

The public `shadowColor` prop is a genuine runtime override. It may override the shared shadow color without regenerating the shadow recipe in React.

## Current web rendering

The current `.bottom-sheet` root already owns scrolling, the translated drag/settle offset, anchor measurements, and the top-only rounded sheet surface. Because that root uses `overflow: auto`, a descendant shadow painter inside it would be clipped.

The current implementation therefore paints the generated elevation recipe on the existing root using `.elevation-host` plus `data-elevation`. This avoids introducing another measured/transformed wrapper solely for the shadow.

That host choice is a web implementation detail, not a Material API contract. A future implementation may use a different paint boundary or wrapper if it preserves the same Material level1 shadow, sheet geometry, scrolling, measurements, anchor behavior, transforms, gestures, and modal semantics.

`@m3-ui/tokens/elevation.css` owns immutable shadow geometry/opacities, shared elevation CSS applies the generated recipe, and `ThemeProvider` owns the concrete `--shadow` role.

## Runtime and color ownership

`getBottomSheetElevationLevel()` currently selects the standard/modal semantic level. `getBottomSheetStyle()` owns surface/handle/shape/motion projection and remains independent of shadow serialization.

The canonical BottomSheet token branch uses semantic DTCG aliases for its container, drag-handle, and focus-indicator colors. `ThemeProvider` resolves those roles at runtime; React should not decode runtime CSS values back into semantic role names.

Sheet anchors, measurements, pointer drag state, velocity dampening, settle-target selection, hidden/partial/expanded state, modal focus containment, Escape/outside-dismiss lifecycle, and transform motion remain runtime behavior. Elevation work should preserve those observable behaviors rather than freeze a particular DOM arrangement.

## CSS packaging

Source/dev and modular style consumers currently include generated elevation CSS and shared elevation paint CSS before `bottom-sheet.css`. Generated shadow geometry remains centralized under the token build output rather than copied into component CSS.

## Validation

Tests should cover the Material/runtime behavior that matters:

- standard and modal sheets select canonical `level1` shadow elevation;
- the actual paint boundary computes the generated level1 shadow;
- the public `shadowColor` override still affects paint;
- existing width, top-only shape, handle geometry, anchors, drag/settling behavior, motion, scrim, focus containment, and dismissal semantics remain correct.

Do not add a source-regex guard for `.elevation-host`, wrapper names, `sheetRef` placement, or a specific DOM hierarchy. If the paint implementation changes, update these notes and validate the resulting behavior directly.
