import clsx from 'clsx';
import type { CSSProperties, HTMLAttributes } from 'react';
import './three-pane-scaffold.css';

export const LevitatedPaneScrimDefaults = {
  /** AndroidX default: black at 32% opacity. */
  Color: 'rgb(0 0 0 / 32%)',
} as const;

export interface LevitatedPaneScrimProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
  color?: CSSProperties['backgroundColor'];
}

/**
 * Default interaction-blocking scrim for a levitated pane.
 *
 * The scaffold owns stacking and sizing; this component owns the AndroidX
 * default translucent-black surface and optional click handler (typically used
 * to dismiss the current destination).
 */
export function LevitatedPaneScrim({
  color = LevitatedPaneScrimDefaults.Color,
  className,
  style,
  ...props
}: LevitatedPaneScrimProps) {
  return (
    <div
      {...props}
      className={clsx('levitated-pane-scrim', className)}
      style={{ backgroundColor: color, ...style }}
    />
  );
}
