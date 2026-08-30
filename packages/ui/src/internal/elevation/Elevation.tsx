import '@m3-ui/tokens/elevation.css';
import clsx from 'clsx';
import type { CSSProperties, HTMLAttributes } from 'react';
import type { ElevationLevel } from './tokens';
import './elevation.css';

type ElevationStyle = CSSProperties & Record<`--${string}`, string | number>;

export interface ElevationProps extends HTMLAttributes<HTMLSpanElement> {
  level?: ElevationLevel;
  shadowColor?: string;
}

/**
 * Material elevation paint primitive.
 *
 * Component consumers select the semantic elevation level and let this
 * primitive own the paint layer. Keep component-specific classes, styles and
 * motion on the owning component boundary rather than passing them to
 * <Elevation>. shadowColor is reserved for genuine runtime color overrides.
 */
export function Elevation({
  level = 'level0',
  shadowColor,
  className,
  style,
  ...props
}: ElevationProps) {
  const elevationStyle: ElevationStyle = {
    ...(shadowColor === undefined
      ? {}
      : { '--_elevation-shadow-color': shadowColor }),
    ...style,
  };

  return (
    <span
      {...props}
      aria-hidden="true"
      className={clsx('elevation', className)}
      data-elevation={level}
      style={elevationStyle}
    />
  );
}
