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
 * primitive own the paint layer. Do not add component-specific alias classes
 * merely to name <Elevation>; keep structural component styling on the owning
 * component boundary. Genuine runtime values such as shadowColor or a
 * runtime-selected transition style may still be passed when behavior needs
 * them. Existing alias callers are migration debt, not a reason to type-lock
 * the primitive API.
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
