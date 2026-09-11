import '@m3-ui/tokens/time-picker.css';
import type { CSSProperties } from 'react';

/** Renderer mechanics from the reviewed Compose TimePicker implementation. */
export const timePickerRuntime = {
  dialLabelRadius: 101,
  inner24HourRadius: 69,
  pointerDeadZone: 30,
  autoHorizontalMinWidth: 560,
  standardDisplayDialGap: 36,
  vibrantVerticalDisplayDialGap: 12,
  vibrantHorizontalDisplayDialGap: 52,
  standardVerticalClockFaceBottomSpace: 24,
  vibrantVerticalClockFaceBottomSpace: 0,
  vibrantHorizontalPeriodSelectorHeight: 40,
  vibrantVerticalPadding: 12,
  vibrantHorizontalPadding: 24,
} as const;

export type TimePickerStyle = CSSProperties & Record<`--${string}`, string | number>;

/** Narrow renderer-layout bridge. Static token defaults and motion are generated CSS. */
export function getTimePickerStyle(): TimePickerStyle {
  return {
    '--_tp-standard-display-dial-gap': `${timePickerRuntime.standardDisplayDialGap}px`,
    '--_tp-vibrant-vertical-display-dial-gap': `${timePickerRuntime.vibrantVerticalDisplayDialGap}px`,
    '--_tp-vibrant-horizontal-display-dial-gap': `${timePickerRuntime.vibrantHorizontalDisplayDialGap}px`,
    '--_tp-standard-vertical-clock-face-bottom-space': `${timePickerRuntime.standardVerticalClockFaceBottomSpace}px`,
    '--_tp-vibrant-vertical-clock-face-bottom-space': `${timePickerRuntime.vibrantVerticalClockFaceBottomSpace}px`,
    '--_tp-vibrant-period-h-height': `${timePickerRuntime.vibrantHorizontalPeriodSelectorHeight}px`,
    '--_tp-vibrant-vertical-padding': `${timePickerRuntime.vibrantVerticalPadding}px`,
    '--_tp-vibrant-horizontal-padding': `${timePickerRuntime.vibrantHorizontalPadding}px`,
  };
}
