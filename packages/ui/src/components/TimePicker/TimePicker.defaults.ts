import '@m3-ui/tokens/time-picker.css';
import type { CSSProperties } from 'react';

/** Renderer geometry from the pinned Compose TimePicker implementation. */
export const timePickerRuntime = {
  dialLabelRadius: 101,
  inner24HourRadius: 69,
  pointerDeadZone: 30,
  autoHorizontalMinWidth: 560,
} as const;

export type TimePickerStyle = CSSProperties & Record<`--${string}`, string | number>;

/**
 * @deprecated Static TimePicker defaults are generated into @m3-ui/tokens/time-picker.css.
 * Kept temporarily as a no-op compatibility bridge for existing imports.
 */
export function getTimePickerStyle(): TimePickerStyle {
  return {};
}
