# DatePicker architecture contract

Read this file before changing DatePicker token ownership, elevation painting, modal/docked surface behavior, calendar geometry, or display-mode runtime behavior.

## Elevation ownership

DatePicker has two different elevation contracts and they must stay distinct.

- `variant="modal"` is dialog content. The Dialog surface owns the modal shadow, so DatePicker itself selects semantic `level0` and paints no shadow.
- `variant="docked"` is a standalone web surface. Its canonical `component.datePickerDocked.containerElevation` token is `level3`, and the DatePicker root must paint that level.

`getDatePickerElevationLevel()` is the single runtime selector for this distinction. Runtime code may select the semantic level, but it must not serialize Material shadow geometry in TypeScript.

`DatePicker.defaults.ts` must not call `getElevationBoxShadow()` or emit `--_date-picker-box-shadow`.

## Why DatePicker uses elevation host paint

The existing `.date-picker` root deliberately owns the rounded clipping boundary:

```css
.date-picker {
  overflow: hidden;
  border-radius: var(--_date-picker-container-radius);
}
```

A descendant `<Elevation>` painter would be clipped by that root. Adding an outer wrapper solely for elevation would change the existing DatePicker DOM/geometry contract for no semantic benefit.

Therefore DatePicker and DateRangePicker use the shared host mode on the existing root:

```text
class="date-picker elevation-host"
data-elevation="level0 | level3"
```

`@m3-ui/tokens/elevation.css` owns immutable shadow geometry/opacities. `internal/elevation/elevation.css` applies the host `box-shadow`. `ThemeProvider` owns the concrete `--shadow` role.

The host paint primitive must not change DatePicker sizing, clipping, calendar grid geometry, animation or interaction ownership.

## Modal versus docked contract

Modal DatePicker deliberately remains `level0` even though it can be rendered without a Dialog in isolated stories. That renderer rule reflects the component contract: Compose DatePicker is dialog content and does not add another modal shadow.

Docked DatePicker uses canonical `level3`. Do not collapse this into a generic component-wide elevation value, and do not give modal DatePicker the docked shadow merely to make an isolated story look elevated.

The same distinction applies to DateRangePicker because it shares the same root surface implementation.

## Runtime behavior boundary

Calendar/date-only state, year-range validation, locale formatting, RAC focus/selection state, month navigation, year chooser behavior, display-mode transitions and reduced-motion behavior remain runtime concerns.

Elevation work must not change those mechanics. In particular, do not add/remove wrappers around `.date-picker`, move the root clipping boundary, or change calendar/content geometry solely to paint a shadow.

The shared `packages/ui/src/layout/**` workstream is separate and must not be edited as part of DatePicker elevation/token migration.

## CSS packaging

Source/dev consumers import generated elevation CSS and shared host paint CSS before `date-picker.css`.

The modular `@m3-ui/ui/styles/DatePicker.css` entry must inline, in order:

1. `packages/tokens/dist/generated/elevation.css`;
2. `packages/ui/src/internal/elevation/elevation.css`;
3. `packages/ui/src/components/DatePicker/date-picker.css`.

## Browser contract

Browser tests must verify both semantic branches on the actual root host:

- modal root has `data-elevation="level0"` and computed `box-shadow: none`;
- docked root has `data-elevation="level3"` and a non-`none` computed `box-shadow`.

Existing geometry, date selection, keyboard, locale, motion and Dialog-composition browser contracts remain authoritative.

## Forbidden regressions

Do not:

- restore `getElevationBoxShadow()` or `--_date-picker-box-shadow`;
- hardcode level3 shadow geometry/opacities in DatePicker CSS or TypeScript;
- add a descendant shadow painter inside the clipped root;
- add a wrapper solely for elevation;
- make modal DatePicker paint the docked level3 shadow;
- make docked DatePicker level0 while its canonical token remains level3;
- change DatePicker calendar/layout mechanics as part of elevation migration;
- edit `packages/ui/src/layout/**` for this component migration.
