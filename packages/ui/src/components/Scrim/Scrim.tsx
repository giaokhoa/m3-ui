import clsx from 'clsx';
import type { HTMLAttributes } from 'react';
import {
  getScrimStyle,
  type ScrimStyleOptions,
} from './Scrim.defaults';
import './scrim.css';

type ScrimDomProps = Omit<
  HTMLAttributes<HTMLElement>,
  | 'aria-hidden'
  | 'aria-label'
  | 'children'
  | 'color'
  | 'onClick'
  | 'role'
  | 'tabIndex'
>;

type ScrimBaseProps = ScrimDomProps & ScrimStyleOptions;

export type ScrimProps =
  | (ScrimBaseProps & {
      /** Accessible action exposed when the scrim dismisses a modal surface. */
      onDismiss: () => void;
      'aria-label': string;
    })
  | (ScrimBaseProps & {
      /** Passive scrims are decorative and expose no click semantics. */
      onDismiss?: undefined;
      'aria-label'?: never;
    });

/**
 * Material 3 visual scrim primitive.
 *
 * The owner remains responsible for portals, stacking, focus trapping and
 * Escape handling. A dismissible scrim is intentionally removed from the tab
 * order so it does not compete with modal content, while native button
 * semantics keep the dismiss action available to assistive technology.
 */
export function Scrim({
  onDismiss,
  containerColor,
  containerOpacity,
  alpha,
  className,
  style,
  'aria-label': ariaLabel,
  ...props
}: ScrimProps) {
  const mergedClassName = clsx('scrim', className);
  const mergedStyle = {
    ...getScrimStyle({ containerColor, containerOpacity, alpha }),
    ...style,
  };

  if (onDismiss) {
    return (
      <button
        {...props}
        aria-label={ariaLabel}
        className={mergedClassName}
        style={mergedStyle}
        tabIndex={-1}
        type="button"
        onClick={onDismiss}
      />
    );
  }

  return (
    <div
      {...props}
      aria-hidden="true"
      className={mergedClassName}
      style={mergedStyle}
    />
  );
}
