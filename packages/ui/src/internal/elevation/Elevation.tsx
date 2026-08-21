import type { CSSProperties, HTMLAttributes } from 'react';
import type { ElevationLevel } from '@m3/tokens/elevation';
import { getElevationBoxShadow } from './elevation';
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
      className={className ? `m3-elevation ${className}` : 'm3-elevation'}
      data-elevation={level}
      style={elevationStyle}
    />
  );
}
