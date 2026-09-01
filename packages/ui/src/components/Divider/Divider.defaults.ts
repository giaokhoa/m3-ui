import type { CSSProperties } from 'react';

export type DividerThickness = number | string;

export type DividerStyle = CSSProperties &
  Record<`--${string}`, string | number>;

function cssLength(value: DividerThickness): string {
  return typeof value === 'number' ? `${value}px` : value;
}

export function getDividerStyle(
  options: {
    color?: CSSProperties['color'];
    thickness?: DividerThickness;
  } = {},
): DividerStyle {
  const style: DividerStyle = {};

  if (options.color !== undefined) {
    style['--_divider-color'] = options.color;
  }
  if (options.thickness !== undefined) {
    style['--_divider-thickness'] = cssLength(options.thickness);
  }

  return style;
}
