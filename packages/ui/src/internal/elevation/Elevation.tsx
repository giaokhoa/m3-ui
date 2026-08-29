import clsx from 'clsx';
import type { CSSProperties, HTMLAttributes } from 'react';
import type { ElevationLevel } from './tokens';
import { getElevationBoxShadow } from './shadow';
import './elevation.css';

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
  const elevationStyle: CSSProperties = {
    boxShadow: getElevationBoxShadow(level, shadowColor),
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
