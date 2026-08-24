import * as token from '@m3/tokens';
import type { CSSProperties } from 'react';
import { pxNumber } from '../../internal/tokenValues';

export type DividerThickness = number | string;

export type DividerStyle = CSSProperties &
  Record<`--${string}`, string | number>;

export const dividerTokens = {
  color: token.ComponentDividerColor,
  thickness: pxNumber(token.ComponentDividerThickness),
} as const;

function cssLength(value: DividerThickness | undefined): string {
  const resolved = value ?? dividerTokens.thickness;
  return typeof resolved === 'number' ? `${resolved}px` : resolved;
}

export function getDividerStyle(
  options: {
    color?: CSSProperties['color'];
    thickness?: DividerThickness;
  } = {},
): DividerStyle {
  return {
    '--_divider-color': options.color ?? dividerTokens.color,
    '--_divider-thickness': cssLength(options.thickness),
  };
}
