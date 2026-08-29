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
