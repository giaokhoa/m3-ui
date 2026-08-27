import * as token from '@m3-ui/tokens';
import type { CSSProperties } from 'react';
import { pxNumber } from '../../internal/tokenValues';

export type BadgeStyle = CSSProperties & Record<`--${string}`, string | number>;

interface TypographyStyleTokens {
  readonly fontFamily: string;
  readonly fontSize: string;
  readonly lineHeight: string;
  readonly fontWeight: number;
  readonly letterSpacing: string;
}

const shapeRadius = {
  full: token.ShapeFull,
} as const;

type BadgeShape = keyof typeof shapeRadius;
type TypographyRole = keyof typeof typography;

const typography = {
  labelSmall: {
    fontFamily: token.TypographyLabelSmallFontFamily,
    fontSize: token.TypographyLabelSmallFontSize,
    lineHeight: token.TypographyLabelSmallLineHeight,
    fontWeight: token.TypographyLabelSmallFontWeight,
    letterSpacing: token.TypographyLabelSmallLetterSpacing,
  },
} as const satisfies Record<string, TypographyStyleTokens>;

export const badgeTokens = {
  small: {
    color: token.ComponentBadgeSmallColor,
    shape: token.ComponentBadgeSmallShape as BadgeShape,
    size: pxNumber(token.ComponentBadgeSmallSize),
  },
  large: {
    color: token.ComponentBadgeLargeColor,
    contentColor: token.ComponentBadgeLargeLabelTextColor,
    typography:
      typography[token.ComponentBadgeLargeLabelTypography as TypographyRole],
    shape: token.ComponentBadgeLargeShape as BadgeShape,
    size: pxNumber(token.ComponentBadgeLargeSize),
  },
} as const;

// Layout mechanics from pinned AndroidX Compose Badge.kt. These are renderer
// behavior rather than canonical design tokens and deliberately stay beside
// the consumer.
export const badgeRuntime = {
  contentHorizontalPadding: 4,
  dotOffset: 6,
  contentHorizontalOffset: 12,
  contentVerticalOffset: 14,
} as const;

function typefaceRoleVariable(role: string): string {
  return `var(--font-family-${role})`;
}

export function getBadgeStyle(
  hasContent: boolean,
  options: {
    containerColor?: CSSProperties['color'];
    contentColor?: CSSProperties['color'];
  } = {},
): BadgeStyle {
  const selected = hasContent ? badgeTokens.large : badgeTokens.small;

  return {
    '--_badge-container-color': options.containerColor ?? selected.color,
    '--_badge-content-color': hasContent
      ? options.contentColor ?? badgeTokens.large.contentColor
      : 'transparent',
    '--_badge-size': `${selected.size}px`,
    '--_badge-radius': shapeRadius[selected.shape],
    '--_badge-padding-inline': hasContent
      ? `${badgeRuntime.contentHorizontalPadding}px`
      : '0px',
    '--_badge-font-family': typefaceRoleVariable(
      badgeTokens.large.typography.fontFamily,
    ),
    '--_badge-font-size': badgeTokens.large.typography.fontSize,
    '--_badge-line-height': badgeTokens.large.typography.lineHeight,
    '--_badge-font-weight': badgeTokens.large.typography.fontWeight,
    '--_badge-letter-spacing': badgeTokens.large.typography.letterSpacing,
  };
}

export function getBadgedBoxStyle(): BadgeStyle {
  return {
    '--_badge-dot-offset': `${badgeRuntime.dotOffset}px`,
    '--_badge-content-horizontal-offset': `${badgeRuntime.contentHorizontalOffset}px`,
    '--_badge-content-vertical-offset': `${badgeRuntime.contentVerticalOffset}px`,
  };
}
