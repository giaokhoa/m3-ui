# DatePicker implementation notes

Read this file before changing DatePicker token ownership, elevation painting, modal/docked surface behavior, calendar geometry, or display-mode runtime behavior.

## Material elevation semantics

DatePicker has two distinct semantic elevation cases:

- `variant="modal"` is dialog content. The Dialog surface owns the modal shadow, so DatePicker itself selects `level0` and adds no second shadow.
- `variant="docked"` is a standalone surface. Its canonical `component.datePickerDocked.containerElevation` token is `level3`.

`getDatePickerElevationLevel()` currently selects between those cases. Runtime code may choose the semantic level, while immutable Material shadow geometry remains compiler-owned rather than being rebuilt in TypeScript.

The same modal/docked distinction applies to DateRangePicker because it shares the same surface implementation.

## Current web rendering

The current `.date-picker` root owns rounded clipping with `overflow: hidden`. A descendant shadow painter inside that clipped root would not render the outer shadow correctly, so the current implementation paints the generated elevation recipe on the root using `.elevation-host` and `data-elevation`.

That host-paint arrangement is an implementation detail, not the semantic DatePicker contract. A future implementation may use another paint boundary if it preserves modal `level0`, docked `level3`, clipping, calendar geometry, animation, interaction behavior, and Dialog composition.

`@m3-ui/tokens/elevation.css` owns immutable shadow geometry/opacities, shared elevation CSS applies the generated recipe, and `ThemeProvider` owns the concrete `--shadow` role.

## Runtime behavior

Calendar/date state, year-range validation, locale formatting, React Aria focus/selection state, month navigation, year chooser behavior, display-mode transitions, and reduced-motion behavior remain runtime concerns. Elevation work should preserve those observable mechanics rather than freeze the current wrapper/root structure.

Modal DatePicker remains semantically `level0` even in isolated stories; the standalone story does not change its role as dialog content. Docked DatePicker remains canonical `level3` unless the Material/token source changes.

## CSS packaging

Source/dev and modular style consumers currently include generated elevation CSS and shared elevation paint CSS before `date-picker.css`. Generated shadow geometry remains centralized under the token build output rather than copied into DatePicker CSS.

## Validation

Tests should cover the actual semantic/rendering result:

- modal DatePicker selects `level0` and computes no DatePicker-owned shadow;
- docked DatePicker selects canonical `level3` and computes a visible generated shadow;
- existing clipping, calendar geometry, date selection, keyboard behavior, locale behavior, motion, and Dialog composition remain correct.

Do not add a source-regex guard for `.elevation-host`, wrapper names, or a particular DOM hierarchy. If the paint implementation changes, update these notes and validate the resulting Material behavior directly.
